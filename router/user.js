const express=require('express');
const router=express.Router();
const controller=require('../controller/user/user_controller');

router.get('/',controller.index);
router.get('/single_product/:id',controller.single_product);
router.get('/product_cat/:id',controller.product_cat);
router.get('/logout',(req,res)=>{
    req.logOut((err)=>{
        if(err){
            console.log("logout err in user : ",err);
        }
        else{
            return res.redirect('/')
        }
    })
})
router.get('/categoryPage',controller.category)
//review
router.get('/addressPage/:id',controller.addressPage);
router.get('/addressPost/:id',controller.addressPost);
router.get('/paymentPage/:id',controller.paymentPage)
module.exports=router;