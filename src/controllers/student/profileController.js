'use strict';

const UserModel    = require('../../models/userModel');
const { setFlash } = require('../../utils/flash');
const bcrypt       = require('bcrypt');
const { validationResult } = require('express-validator');

const ProfileController = {
  /* GET /student/profile */
  async show(req, res) {
    const user = await UserModel.findById(req.session.user.id);
    res.render('student/profile', {
      title: 'Profil Saya',
      layout: 'layouts/student',
      user,
    });
  },

  /* POST /student/profile */
  async update(req, res) {
    const errResult = validationResult(req);
    if (!errResult.isEmpty()) {
      setFlash(req, 'error', errResult.array()[0].msg);
      return res.redirect('/student/profile');
    }
    try {
      const { name, prodi, phone } = req.body;
      await UserModel.updateProfile(req.session.user.id, { name, prodi, phone });
      req.session.user.name = name;
      setFlash(req, 'success', 'Profil berhasil diperbarui.');
      return res.redirect('/student/profile');
    } catch (err) {
      console.error('[ProfileController.update]', err);
      setFlash(req, 'error', 'Gagal memperbarui profil.');
      return res.redirect('/student/profile');
    }
  },

  /* POST /student/profile/password */
  async changePassword(req, res) {
    try {
      const { current_password, new_password, new_password_confirm } = req.body;
      if (new_password !== new_password_confirm) {
        setFlash(req, 'error', 'Konfirmasi password baru tidak cocok.');
        return res.redirect('/student/profile');
      }
      if (new_password.length < 8) {
        setFlash(req, 'error', 'Password baru minimal 8 karakter.');
        return res.redirect('/student/profile');
      }
      const user  = await UserModel.findById(req.session.user.id);
      const match = await bcrypt.compare(current_password, user.password_hash);
      if (!match) {
        setFlash(req, 'error', 'Password lama tidak benar.');
        return res.redirect('/student/profile');
      }
      const hash = await bcrypt.hash(new_password, 12);
      await UserModel.updatePassword(req.session.user.id, hash);
      setFlash(req, 'success', 'Password berhasil diubah.');
      return res.redirect('/student/profile');
    } catch (err) {
      console.error('[ProfileController.changePassword]', err);
      setFlash(req, 'error', 'Gagal mengubah password.');
      return res.redirect('/student/profile');
    }
  },
};

module.exports = ProfileController;
