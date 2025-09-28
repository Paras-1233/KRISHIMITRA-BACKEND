import express from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem,clearCart } from '../controllers/cartController.js';

const router = express.Router();

router.get('/:buyerId', getCart);
router.post('/:buyerId', addToCart);
router.put('/:buyerId/:productId', updateCartItem);
router.delete('/:buyerId/:productId', removeCartItem);
router.delete('/:buyerId/clear', clearCart);


export default router;
