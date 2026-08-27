import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'Client API' })
})

router.get('/profile', (req, res) => {
  res.json({ message: 'Client profile' })
})

router.get('/orders', (req, res) => {
  res.json({ message: 'Client orders' })
})

router.post('/orders', (req, res) => {
  res.json({ message: 'Order created' })
})

export default router
