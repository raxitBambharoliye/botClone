const model = require('../../model/admin_model');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

//login
module.exports.login_page = (req, res) => {
    if (req.isAuthenticated()) {
        req.flash('success', `welcome back ! ${req.user.name}`)
        return res.redirect('/des');
    } else {
        return res.render('login')
    }
}

module.exports.login = async (req, res) => {
    return res.redirect('/admin/product/view')
}


//change password
module.exports.change_pass = async (req, res) => {
    try {
        if (req.body.n_password == req.body.c_password) {
            let pass = await bcrypt.hash(req.body.n_password, 10);
            let data = await model.findOne({ email: req.cookies.email });
            if (data) {
                let update = await model.findByIdAndUpdate(data.id, ({ password: pass }));
                if (update) {
                    res.redirect('/');
                    req.flash('success', 'password reset successfully');
                }
            } else {
                req.flash('err', "Password Can't Match ");
                res.redirect('back');
            }
        }
    } catch (err) {
        console.log('change password in forget :', err);
    }
}
//check otp
module.exports.ch_otp = async (req, res) => {
    try {
        if (await bcrypt.compare(req.body.otp, req.cookies.otp)) {
            res.render('admin_panel/forget/ch_pass');
        } else {
            req.flash('err', 'Invalid Otp');
            res.redirect('back');
        }
    } catch (err) {
        console.log('check otp post err in admin : ', err);
    }
}
//for updateAt & createdAt 
const nDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Calcutta'
});

module.exports.add_page = (req, res) => {
    return res.render('admin_panel/admin/admin_add');
}

module.exports.add = async (req, res) => {
    try {
        let data = await model.findOne({ email: req.body.email });
        if (!data) {
            req.body.role='admin';
            req.body.createAt = nDate;
            req.body.updateAt = nDate;
            req.body.active = true;
            req.body.password = await bcrypt.hash(req.body.password, 10);
            req.body.name = req.body.fname + " " + req.body.lname;
            let image = '';
            if (req.file) {
                image = model.upPath + '/' + req.file.filename;
            }
            req.body.image = image;

            let create = await model.create(req.body);
            if (create) {
                console.log('admin addede ');
                req.flash('success', "Admin Added Successfully");
                return res.redirect('back');
            } else {
                console.log('something rong ');
                req.flash('err', "Place Enter All Information");
            }
        } else {
            // console.log('Email already excited');
            req.flash('val_err', "Email already excited");
            res.redirect('back');
        }
    } catch (err) {
        req.flash('err', "Place Enter All Information");
        console.log('add admin err : ', err);
    }
}

module.exports.view = async (req, res) => {
    try {
        let search = '';
        let page = 1;
        let par_page = 3;

        if (req.query.search) {
            search = req.query.search;
        }
        if (req.query.page) {
            page = req.query.page;
        }

        if (req.query.status == 'Active') {
            await model.findByIdAndUpdate(req.query.id, { active: false });
        }
        if (req.query.status == 'deActive') {
            await model.findByIdAndUpdate(req.query.id, { active: true });
        }
        let count = await model.find({
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        }).countDocuments();

        let t_page = Math.ceil(count / par_page);

        let data = await model.find({
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        }).limit(par_page * 1)
            .skip((page - 1) * par_page)
            .exec();
        return res.render('admin_panel/admin/admin_view', ({ data, search, count: t_page, page }));
    } catch (err) {
        console.log('admin view err ', err);
    }
}

module.exports.edit_page = async (req, res) => {
    try {
        let data = await model.findById(req.params.id);

        return res.render('admin_panel/admin/admin_edit', ({ data: data }));
    } catch (err) {
        console.log('admin edit page err : ', err);
    }
}

module.exports.edit = async (req, res) => {
    try {
        let id = req.body.eid;
        let data = await model.findById(id);
        if (data) {
            if (req.file) {
                let di = path.join(__dirname, '..', data.image);
                fs.unlinkSync(di);

                req.body.image = model.upPath + '/' + req.file.filename;
                req.body.name = req.body.fname + " " + req.body.lname;
                req.body.updateAt = nDate;

                let update = await model.findByIdAndUpdate(id, req.body);
                if (update) {
                    req.flash('success', 'Admin Updated');
                    return res.redirect('/admin/view');
                }
            } else {
                req.body.image = data.image;
                req.body.name = req.body.fname + " " + req.body.lname;
                req.body.updateAt = nDate;

                let update = await model.findByIdAndUpdate(id, req.body);
                if (update) {
                    req.flash('success', 'Admin Updated');
                    return res.redirect('/admin/view');
                }
            }
        } else {
            req.flash('err', 'something was wrong');
        }
    } catch (err) {
        console.log('edit post err in admin: ', err);
    }
}

module.exports.delete = async (req, res) => {
    try {
        let data = await model.findById(req.params.id);
        if (data) {
            let di = path.join(__dirname, '../..', data.image);
            fs.unlinkSync(di);

            let delate = await model.findByIdAndDelete(req.params.id);
            if (delate) {
                req.flash('success', 'admin deleted successfully');
                res.redirect('back');
            }
        }
    } catch (err) {
        console.log('admin delete err : ', err);
    }
}

module.exports.mul_del = async (req, res) => {
    try {
        let ids = req.body.mulDel;
        ids.shift();
        ids.forEach(async element => {
            let data = await model.findById(element);
            fs.unlinkSync(path.join(__dirname, '../..', data.image));
            await model.findByIdAndDelete(element);
        });
        req.flash('success', 'All Admin Deleted Successfully');
        return res.redirect('back');
    } catch (err) {
        console.log('multi delete err in admin: ', err);
    }
}

module.exports.profile = async (req, res) => {
    return res.render('admin_panel/admin/admin_profile');
}

module.exports.edit_profile_page = async (req, res) => {
    try {
        let data = await model.findById(req.params.id);
        if (data) {
            res.render('admin_panel/admin/edit_profile', { data })
        }
    } catch (err) {
        console.log('edit profile page err in admin : ', err);
    }
}

module.exports.edit_profile = async (req, res) => {
    try {
        let id = req.body.eid;
        let data = await model.findById(id);
        if (data) {
            if (req.file) {
                let di = path.join(__dirname, '..', data.image);
                fs.unlinkSync(di);

                req.body.image = model.upPath + '/' + req.file.filename;
                req.body.name = req.body.fname + " " + req.body.lname;
                req.body.updateAt = nDate;

                let update = await model.findByIdAndUpdate(id, req.body);
                if (update) {
                    req.flash('success', 'Profile  Updated');
                    return res.redirect('/admin/profile');
                }
            } else {
                req.body.image = data.image;
                req.body.name = req.body.fname + " " + req.body.lname;
                req.body.updateAt = nDate;

                let update = await model.findByIdAndUpdate(id, req.body);
                if (update) {
                    req.flash('success', 'Profile  Updated');
                    return res.redirect('/admin/profile');
                }
            }
        } else {
            req.flash('err', 'something was wrong');
        }
    } catch (err) {
        console.log('edit post err in admin: ', err);
    }
}
//change password in profile
module.exports.change_password = async (req, res) => {
    try {
        let data = await model.findById(req.params.id);
        if (data) {
            res.render('admin_panel/admin/ch_password')
        }

    } catch (err) {
        console.log('change password  page err in admin : ', err);
    }
}
