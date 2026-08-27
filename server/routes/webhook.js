import { Router } from 'express'

const router = Router()

router.post('/stripe', (req, res) => {
  res.json({ received: true })
})

router.post('/clerk', (req, res) => {
  res.json({ received: true })
})

export default router
