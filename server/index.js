import express from 'express'
import riderRoutes from './routes/rider.js'
import clientRoutes from './routes/client.js'
import adminRoutes from './routes/admin.js'
import webhookRoutes from './routes/webhook.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

app.use('/rider', riderRoutes)
app.use('/client', clientRoutes)
app.use('/admin', adminRoutes)
app.use('/webhook', webhookRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
