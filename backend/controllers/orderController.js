const Order = require('../models/Order');
const User = require('../models/User');
const { uploadFromBuffer } = require('../utils/cloudinary');
const exceljs = require('exceljs');
const axios = require('axios');

exports.createOrder = async (req, res) => {
  try {
    const { 
      clientId, category, priceRmb, unitsPerPackage, cbmPerPackage,
      shop, contact, shopRef, phone, measure, weight, color, item, packagingType, barcode,
      unit
    } = req.body;
    
    // Validations
    if (!req.file) return res.status(400).json({ message: 'Photo is required' });
    if (!clientId) return res.status(400).json({ message: 'Client ID is required' });

    // Ensure the client belongs to the agent (optional strict check)
    // For now we allow agent to create for any provided clientId if they are AGENT

    const result = await uploadFromBuffer(req.file.buffer);

    const newOrder = new Order({
      agentId: req.user.id,
      clientId,
      category,
      priceRmb,
      unitsPerPackage,
      cbmPerPackage,
      photoUrl: result.secure_url,
      packagesToOrder: 0,
      shop, contact, shopRef, phone, measure, weight, color, item, packagingType, barcode,
      unit
    });

    await newOrder.save();
    res.status(201).json(newOrder);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error creating order' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'CLIENT') {
      filter.clientId = req.user.id;
    } else if (req.user.role === 'AGENT') {
      filter.agentId = req.user.id;
    }
    // ADMIN sees all

    const orders = await Order.find(filter)
      .populate('clientId', 'username')
      .populate('agentId', 'username')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error fetching orders' });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { packagesToOrder } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Authorization
    if (req.user.role === 'CLIENT' && order.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // Agent could update their own orders maybe? Let's allow Agent or Admin to update more fields later if needed
    // For now, Client updates packagesToOrder
    order.packagesToOrder = packagesToOrder;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error updating order' });
  }
};

exports.bulkUpdateOrders = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, packagesToOrder }
    
    if (!Array.isArray(updates)) return res.status(400).json({ message: 'Updates must be an array' });

    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.id, clientId: req.user.id }, // Security: enforce ownership
        update: { $set: { packagesToOrder: update.packagesToOrder } }
      }
    }));

    await Order.bulkWrite(bulkOps);
    res.json({ message: 'Orders updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error in bulk update' });
  }
};

exports.exportClientOrders = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const client = await User.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const orders = await Order.find({ clientId }).populate('agentId', 'username');

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    // Define columns (17 total)
    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 20 },
      { header: 'Traductor', key: 'agent', width: 15 },
      { header: 'Foto', key: 'photo', width: 20 },
      { header: 'DESCRIPCIÓN', key: 'category', width: 20 },
      { header: 'TAMAÑO', key: 'measure', width: 15 },
      { header: 'NOTA', key: 'contact', width: 20 },
      { header: 'CAJAS', key: 'ordered', width: 15 },
      { header: 'CANT/ CAJA', key: 'units', width: 15 },
      { header: 'UNIT', key: 'unit', width: 10 },
      { header: 'PRECIO', key: 'price', width: 15 },
      { header: 'CBM/ PQTE', key: 'cbm', width: 15 },
      { header: 'SHOP No', key: 'shop', width: 15 },
      { header: 'TELÉFONO', key: 'phone', width: 15 },
      { header: 'PESO', key: 'weight', width: 15 },
      { header: 'COLOR', key: 'color', width: 15 },
      { header: 'TIPO EMPAQUE', key: 'packagingType', width: 18 },
      { header: 'CÓD BARRAS', key: 'barcode', width: 20 },
    ];

    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const rowValues = {
            date: new Date(order.timestamp || order.createdAt).toLocaleDateString(),
            agent: order.agentId ? order.agentId.username : 'N/A',
            category: order.category, // Maps to DESCRIPCION
            measure: order.measure || '', // Maps to TAMANO
            contact: order.contact || '', // Maps to NOTA
            ordered: order.packagesToOrder, // Maps to CAJAS
            units: order.unitsPerPackage, // Maps to CANT/CAJA
            unit: order.unit || 'unid', // Maps to UNIT (new)
            price: order.priceRmb, // Maps to PRECIO
            cbm: order.cbmPerPackage, // Maps to CBM /PQTE
            shop: order.shop || '', // Maps to SHOP No
            phone: order.phone || '', // Maps to TELEFONO
            weight: order.weight || '',
            color: order.color || '',
            packagingType: order.packagingType || '',
            barcode: order.barcode || ''
        };
        const row = worksheet.addRow(rowValues);
        row.height = 100;

        // Download and insert image
        try {
            const response = await axios.get(order.photoUrl, { responseType: 'arraybuffer' });
            const imageId = workbook.addImage({
                buffer: response.data,
                extension: 'webp',
            });
            // Photo is now in column 3 (C) - index 2
            worksheet.addImage(imageId, {
                tl: { col: 2, row: row.number - 1 }, 
                ext: { width: 100, height: 100 }
            });
        } catch (imgErr) {
            console.error('Error fetching image for Excel:', imgErr.message);
            worksheet.getCell(`C${row.number}`).value = 'Image Error';
        }
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=orders_${client.username}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error exporting to Excel' });
  }
};
