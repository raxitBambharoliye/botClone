const category = require('../../model/category_model');
const product = require('../../model/product_model');
const model = require('../../model/slider_model')

const path = require('path');
const fs = require('fs');
//for updateAt & createdAt 
const nDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Calcutta'
});

module.exports.add_page = async (req, res) => {
    try {
        let cat_data = await category.find({ active: true });

        res.render('admin_panel/slider/add_slider', { category: cat_data });
    } catch (err) {
        console.log('add slider page err : ', err);
    }
}



module.exports.product_aj = async (req, res) => {
    try {
        let pro_data = await product.find({
            cat_id: req.body.cat_id,
            active: true
        });
        let option = `<option value="">--select product--</option>`;
        pro_data.forEach(element => {
            option += `<option value="${element.id}">${element.name}</option>`
        });
        res.json(option);
    } catch (err) {
        console.log('get product err in ajax : slider : ', err);
    }
}

module.exports.add = async (req, res) => {
    try {
        req.body.active = true;
        req.body.createAt = nDate;
        req.body.updateAt = nDate;

        if (req.file) {
            req.body.slider_image = model.upPath + '/' + req.file.filename;
        }
        console.log(req.body.slider_image);
        let data = await model.create(req.body);
        if (data) {
            req.flash('success', 'slider added successfully');
            return res.redirect('back');
        }
    } catch (err) {
        console.log('add slider err : ', err);
    }
}

module.exports.view = async (req, res) => {
    try {

        if (req.query.status == 'Active') {
            await model.findByIdAndUpdate(req.query.id, ({ active: false }))
        }
        if (req.query.status == 'deActive') {
            await model.findByIdAndUpdate(req.query.id, ({ active: true }))
        }

        let par_page = 2;
        let page = 1;
        let search = '';

        if (req.query.search) {
            search = req.query.search;
        }

        if (req.query.page) {
            page = req.query.page;
        }

        let count = await model.find({
        }).countDocuments();
        let t_page = Math.ceil(count / par_page);

        let data = await model.find({})
            .limit(par_page * 1)
            .skip((page - 1) * par_page)
            .exec();

        return res.render('admin_panel/slider/view_slider', { search, page, count: t_page, data });
    }catch (err) {
        console.log('view page err in slider : ', err);
    }
}

module.exports.edit_page = async (req, res) => {
    try {
        let data = await model.findById(req.params.id).populate('product_id').exec();
        let cat_data = await category.find({ active: true })
        let product_data=await product.find({
            active:true,
            cat_id:data.product_id.cat_id,
        })
        if (data) {
            return res.render('admin_panel/slider/edit_slider', ({
                data,
                category: cat_data,
                product:product_data
            }));
        }
    } catch (err) {
        console.log('edit page error in slider ', err);
    }
}
module.exports.edit = async (req, res) => {
    try {
        let id = req.body.eid;
        let data = await model.findById(id);
        if (data) {
            if (req.file) {
                let di = path.join(__dirname, '../..', data.slider_image);
                fs.unlinkSync(di);

                req.body.slider_image = model.upPath + '/' + req.file.filename;
                req.body.updateAt = nDate;

                let update = await model.findByIdAndUpdate(id, req.body);
                if (update) {
                    req.flash('success', 'Slider Updated');
                    return res.redirect('/admin/slider/view');
                }
            } else {
                req.body.image = data.slider_image;
                req.body.updateAt = nDate;

                let update = await model.findByIdAndUpdate(id, req.body);
                if (update) {
                    req.flash('success', 'Slider Updated');
                    return res.redirect('/admin/slider/view');
                }
            }
        } else {
            req.flash('err', 'something was wrong');
            return res.redirect('back');
        }
    } catch (err) {
        console.log('edit post err in admin: ', err);
        return res.redirect('back');
    }
}
module.exports.delete = async (req, res) => {
    try {
        let data = await model.findById(req.params.id);
        if (data) {
                let di = path.join(__dirname, '../..', data.slider_image);
                fs.unlinkSync(di);

                let delate = await model.findByIdAndDelete(req.params.id);
                if (delate) {
                    req.flash('success', 'Slider deleted successfully');
                    res.redirect('back');
                }
        }
    } catch (err) {
        console.log('category delete err : ', err);
    }
}

module.exports.mul_del = async (req, res) => {
    try {
        let ids = req.body.mulDel;
        ids.shift();
        ids.forEach(async element => {
            let data = await model.findById(element);
            fs.unlinkSync(path.join(__dirname, '../..', data.slider_image));
            await model.findByIdAndDelete(element);
        });
        req.flash('success', 'All Category Deleted Successfully');
        return res.redirect('back');
    } catch (err) {
        console.log('multi delete err in admin: ', err);
    }
}