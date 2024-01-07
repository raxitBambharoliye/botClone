const model = require('../../model/product_model');
const category = require('../../model/category_model');
const cart = require('../../model/cart_model');

const path = require('path');
const fs = require('fs');



//for updateAt & createdAt 
const nDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Calcutta'
});

module.exports.add_page = async (req, res) => {
    try {
        let cat_data = await category.find({ active: true });
        if (category) {
            return res.render('admin_panel/product/add_product', ({ category: cat_data }));
        }
    } catch (err) {
        console.log('add page err in product : ', err);
    }
}



module.exports.add = async (req, res) => {
    try {
        req.body.active = true;
        req.body.updateAt = nDate;
        req.body.createAt = nDate;
        let img;
        if (req.files.image) {
            img = model.upPath_single + '/' + req.files.image[0].filename
        }
        let mul_img = [];
        if (req.files.mul_image) {
            req.files.mul_image.forEach(element => {
                let img_p = model.upPath_multi + '/' + element.filename;
                mul_img.push(img_p);
            });
        }

        req.body.image = img;
        req.body.mul_image = mul_img;
        let color=req.body.color.split(',');
        req.body.color= color.filter(color => color.trim() !== '');
        let data = await model.create(req.body);
        if (data) {
            req.flash('success', 'Product Added Successfully');
            res.redirect('back');
        }

    } catch (err) {
        console.log('add err in product : ', err);
    }
}
module.exports.view = async (req, res) => {
    try {
        let page = 1;
        let search = '';
        let par_page = 10;

        if (req.query.page) {
            page = req.query.page;
        }
        if (req.query.search) {
            search = req.query.search;
        }
        if (req.query.status == 'Active') {
            await model.findByIdAndUpdate(req.query.id, { active: false });
        }
        if (req.query.status == 'deActive') {
            await model.findByIdAndUpdate(req.query.id, { active: true });
        }

        let count = await model.find({
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
            ]
        }).countDocuments();
        let t_page = Math.ceil(count / par_page);

        let data = await model.find({
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
            ]
        })
            .populate('cat_id')
            .limit(par_page * 1)
            .skip((page - 1) * par_page)
            .exec();


        if (data) {
            return res.render('admin_panel/product/view_product', {
                data,
                page,
                count: t_page,
                search,
            })
        }
    } catch (err) {
        console.log('view err in product ', err);
    }
}
module.exports.edit_page = async (req, res) => {
    try {
        let data = await model.findById(req.params.id);
        let cat_data = await category.find({ active: true })
        if (data) {
            return res.render('admin_panel/product/edit_product', ({
                data,
                category: cat_data,
                color: data.color
            }));
        }
    } catch (err) {
        console.log('edit page error in product ', err);
    }
}

module.exports.edit = async (req, res) => {
    try {
        let data = await model.findById(req.body.eid);
        if (data) {
            if (req.files) {
                if (req.files.image) {
                    fs.unlinkSync(path.join(__dirname, '../..', data.image))
                    req.body.image = model.upPath_single + '/' + req.files.image[0].filename;
                } else {
                    req.body.image = data.image;
                }
                req.body.updateAt = nDate;
                let color=req.body.color.split(',');
                req.body.color= color.filter(color => color.trim() !== '');
                if (req.files.mul_image) {
                    let n_i = [];
                    for (var i = 0; i < req.files.mul_image.length; i++) {
                        fs.unlinkSync(path.join(__dirname, '../..', data.mul_image[i]))

                        let img = model.upPath_multi + '/' + req.files.mul_image[i].filename;
                        n_i.push(img);
                    }
                    req.body.mul_image = n_i
                } else {
                    req.body.mul_image = data.mul_image;
                }

                let update = await model.findByIdAndUpdate(req.body.eid, req.body);

                if (update) {
                    res.redirect('/admin/product/view');
                    req.flash('success', 'product updated successfully');

                }
            } else {
                req.body.image = data.image;
                req.body.mul_image = data.mul_image;
                req.body.updateAt = nDate;

                let update = await model.findByIdAndUpdate(req.body.eid, req.body);

                if (update) {
                    res.redirect('/admin/product/view');
                    req.flash('success', 'product updated successfully');

                }
            }
        }
    } catch (err) {
        console.log('edit err in product : ', err);
    }
}

module.exports.delete = async (req, res) => {
    try {
        let data = await model.findById(req.params.id);
        if (data) {

            let cart_data = await cart.find({ product_id: data.id });
            if (cart_data) {
                cart_data.forEach(async element => {
                    await cart.findByIdAndDelete(element.id);
                });
            }

            fs.unlinkSync(path.join(__dirname, '../..', data.image))
            for (var i = 0; i < data.mul_image.length; i++) {
                fs.unlinkSync(path.join(__dirname, '../..', data.mul_image[i]))
            }

            let delate = await model.findByIdAndDelete(req.params.id);

            if (delate) {
                res.redirect('/admin/product/view');
                req.flash('success', 'product deleted successfully');

            }
        }
    } catch (err) {
        console.log('delete err in product : ', err);
    }
}

module.exports.mul_del = async (req, res) => {
    try {
        let ids = req.body.mulDel;
        ids.shift();
        ids.forEach(async element => {
            let data = await model.findById(element);

            let cart_data = await cart.find({ product_id: data.id });
            if (cart_data) {
                cart_data.forEach(async element => {
                    await cart.findByIdAndDelete(id);
                });
            }

            if (data) {
                fs.unlinkSync(path.join(__dirname, '../..', data.image))
                for (var i = 0; i < data.mul_image.length; i++) {
                    fs.unlinkSync(path.join(__dirname, '../..', data.mul_image[i]))
                }
            }
            await model.findByIdAndDelete(element);
        });
        req.flash('success', 'all product deleted successfully');
        res.redirect('back');
    } catch (err) {
        console.log('multi delete err in  product : ', err);
    }
}