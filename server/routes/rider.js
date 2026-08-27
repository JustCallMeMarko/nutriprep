import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'Rider API' })
})

router.get('/profile', (req, res) => {
  res.json({ message: 'Rider profile' })
})

router.get('/orders', (req, res) => {
  res.json({ message: 'Rider orders' })
})

router.get('/deliveries', (req, res) => {
  res.json({ message: 'Rider deliveries' })
})

export default router
