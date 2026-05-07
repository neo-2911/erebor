const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// هذه واجهة المستخدم (تطبيق الدردشة المبسط)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>المساعد الذكي</title>
      <style>
        body { font-family: Arial; padding: 15px; background-color: #f0f2f5; margin: 0; }
        #chatbox { height: 70vh; overflow-y: auto; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 15px; }
        .msg { margin-bottom: 15px; padding: 12px; border-radius: 8px; line-height: 1.5; word-wrap: break-word; }
        .user { background: #007bff; color: white; margin-right: 20%; border-bottom-left-radius: 0; }
        .bot { background: #e4e6eb; color: black; margin-left: 20%; border-bottom-right-radius: 0; }
        .input-area { display: flex; gap: 10px; }
        input { flex: 1; padding: 15px; border: 1px solid #ccc; border-radius: 25px; outline: none; font-size: 16px; }
        button { padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 25px; cursor: pointer; font-size: 16px; font-weight: bold;}
      </style>
    </head>
    <body>
      <h2 style="text-align: center; color: #333;">مساعد التحليل البرمجي (Llama 3.1)</h2>
      <div id="chatbox">
        <div class="msg bot">أهلاً بك! النظام يعمل ومستعد لتلقي الأوامر وحل المعادلات المعقدة.</div>
      </div>
      <div class="input-area">
          <input type="text" id="userInput" placeholder="اكتب سؤالك أو أمرك هنا...">
          <button onclick="sendMessage()">إرسال</button>
      </div>

      <script>
        async function sendMessage() {
          const inputField = document.getElementById('userInput');
          const input = inputField.value;
          if(!input) return;
          
          const chatbox = document.getElementById('chatbox');
          chatbox.innerHTML += '<div class="msg user">' + input + '</div>';
          inputField.value = '';
          
          const loadingId = 'loading-' + Date.now();
          chatbox.innerHTML += '<div class="msg bot" id="' + loadingId + '">جاري المعالجة والتفكير...</div>';
          chatbox.scrollTop = chatbox.scrollHeight;

          try {
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: input })
            });
            const data = await response.json();
            document.getElementById(loadingId).remove();
            
            // تحويل النص إلى تنسيق يقرأ المسافات والأسطر
            const formattedReply = data.reply.replace(/\\n/g, '<br>');
            chatbox.innerHTML += '<div class="msg bot">' + formattedReply + '</div>';
          } catch(e) {
            document.getElementById(loadingId).remove();
            chatbox.innerHTML += '<div class="msg bot" style="color:red;">حدث خطأ في الاتصال.</div>';
          }
          chatbox.scrollTop = chatbox.scrollHeight;
        }
      </script>
    </body>
    </html>
  `);
});

// واجهة الاتصال بإنفيديا
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    return res.json({ reply: "خطأ: لم يتم العثور على مفتاح API في إعدادات Render." });
  }

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: userMessage }],
        max_tokens: 1500
      })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      res.json({ reply: "تلقيت استجابة غير مفهومة من الخادم." });
    }
  } catch (error) {
    res.json({ reply: "عذراً، فشل الاتصال بنموذج الذكاء الاصطناعي." });
  }
});

app.listen(port, () => {
  console.log('Server running on port ' + port);
});
