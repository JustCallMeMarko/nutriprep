import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'Admin API' })
})

router.get('/users', (req, res) => {
  res.json({ message: 'Admin users' })
})

router.get('/orders', (req, res) => {
  res.json({ message: 'Admin orders' })
})

router.get('/stats', (req, res) => {
  res.json({ message: 'Admin stats' })
})

export default router
