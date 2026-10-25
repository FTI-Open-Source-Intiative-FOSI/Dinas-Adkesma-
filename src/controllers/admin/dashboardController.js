'use strict';

const ReportModel   = require('../../models/reportModel');
const UserModel     = require('../../models/userModel');
const CategoryModel = require('../../models/categoryModel');

const AdminDashboardController = {
  async index(req, res) {
    const stats      = await ReportModel.getStats();
    const { rows: recentReports } = await ReportModel.findAll({ page: 1, limit: 5 });
    const categories = await CategoryModel.findAll();
    res.render('admin/dashboard', {
      title: 'Dashboard Admin',
      layout: 'layouts/admin',
      stats,
      recentReports,
      categories,
    });
  },
};

module.exports = AdminDashboardController;
