const category = require('../../model/category_model');
const product = require('../../model/product_model');
const slider = require('../../model/slider_model');
const cart = require('../../model/cart_model');
const mongoose = require('mongoose')
const isValidObjectId = mongoose.Types.ObjectId.isValid;
module.exports.index = async (req, res) => {
    try {
        let cat_data = await category.find({ active: true });
        let productAll = await product.find({ active: true });
        let slider_data = await slider.find({ active: true });
        return res.render('user/index', {
            category: cat_data,
            slider: slider_data,
            product: productAll,
        });
    } catch (err) {
        console.log('user index page err : ', err);
    }
}
module.exports.product = async (req, res) => {
    try {
        let cat_data = await category.find({ active: true });
        var cart_count = 0;
        if (req.user) {
            cart_count = await cart.find({ user_id: req.user.id, status: 'pending' }).countDocuments();
        }

        let search = '';

        if (req.query.search) {
            search = req.query.search;
        }



        let product_data = await product.find({
            active: true,
            sub_id: req.params.sub,
            cat_id: req.params.cat,
            ex_id: req.params.ex,
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        });

        return res.render('user/product', {
            category: cat_data,
            product_data: product_data,
            cart_count, search,
            min,
            max,
        });
    } catch (err) {
        console.log('product page load err in user : ', err);
    }
}
module.exports.single_product = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.redirect('back');
        }
        let cat_data = await category.find({ active: true });




        var cart_count = 0;
        if (req.user) {
            cart_count = await cart.find({ user_id: req.user.id, status: 'pending' }).countDocuments();
        }

        let search = '';

        if (req.query.search) {
            search = req.query.search;
        }

        let data = await product.findById(req.params.id);

        let sug = await product.find({ active: true, cat_id: data.cat_id, sub_id: data.sub_id, ex_id: data.ex_id });
        if (data) {
            return res.render('user/single_product', {
                data,
                category: cat_data,
                cart_count,
                sug,
            })
        }
    } catch (err) {
        console.log('single product err in user ', err);
    }
}
module.exports.product_cat = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.redirect('back');
        }
        let cat_data = await category.find({ active: true });
        var cart_count = 0;
        let search = '';

        if (req.user) {
            cart_count = await cart.find({ user_id: req.user.id, status: 'pending' }).countDocuments();
        }

        if (req.query.search) {
            search = req.query.search;
        }

        let product_data = await product.find({
            active: true,
            cat_id: req.params.id,
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        });

        return res.render('user/product_cat', {
            category: cat_data,
            product_data: product_data,
        });
    } catch (err) {
        console.log('product page load err in user : ', err);
    }
}
module.exports.category = async (req, res) => {
    try {
        let categoryData = await category.find({ active: true });
        res.render('user/category', categoryData);
    } catch (err) {
        console.log('category page error catch', err);
    }
}
module.exports.addressPage = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.redirect('back');
        }
        let productId = req.params.id;
        res.render('user/address', { productId })
    } catch (err) {
        console.log('', err);
    }
}
module.exports.addressPost = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.redirect('back');
        }
        let productData=await product.findById(req.params.id);
        res.render('user/cartPage',{product:productData});
    } catch (err) {
        console.log('address post error in user controller ', err);
    }
}
module.exports.paymentPage=async (req,res)=>{
 try{
    if (!isValidObjectId(req.params.id)) {
        return res.redirect('back');
    }
    let productData=await product.findById(req.params.id);
    res.render('user/payment',{productData});
}catch(err){
console.log('payment page error in user controller ',err);
}
}