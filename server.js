const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// هذه الصفحة الرئيسية للتأكد من أن السيرفر يعمل
app.get('/', (req, res) => {
  res.send('خادم الذكاء الاصطناعي يعمل بنجاح ومستعد لتلقي الأوامر!');
});

// هذه الواجهة التي ستستقبل الأوامر منك لاحقاً
app.post('/api/run', (req, res) => {
  const userCommand = req.body.command;
  res.json({ status: "success", message: "تم استلام طلبك: " + userCommand });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
