# SmartGuide AI - Android APK
# Requirements: pip install buildozer kivy

from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput
from kivy.core.window import Window
from kivy.uix.webview import WebView
import threading

Window.size = (400, 700)

class SmartGuideApp(App):
    def build(self):
        self.title = "SmartGuide AI"
        
        layout = BoxLayout(orientation='vertical', padding=20, spacing=15)
        
        # Header
        header = Label(text="🤖 SmartGuide AI", font_size=28, size_hint_y=0.15,
                      color=(0.91, 0.27, 0.38, 1))
        layout.add_widget(header)
        
        subtitle = Label(text="AI Guidance for Any Software", font_size=12,
                        size_hint_y=0.05, color=(0.7, 0.7, 0.7, 1))
        layout.add_widget(subtitle)
        
        # Server IP input
        self.ip_input = TextInput(hint_text="Enter PC IP (e.g., 192.168.1.100)",
                                 size_hint_y=0.08, multiline=False,
                                 background_color=(0.2, 0.2, 0.3, 1),
                                 foreground_color=(1, 1, 1, 1))
        layout.add_widget(self.ip_input)
        
        # Connect button
        connect_btn = Button(text="Connect", size_hint_y=0.08,
                           background_color=(0.91, 0.27, 0.38, 1),
                           color=(1, 1, 1, 1))
        connect_btn.bind(on_press=self.connect_server)
        layout.add_widget(connect_btn)
        
        # Status
        self.status = Label(text="Enter IP and tap Connect", font_size=11,
                           size_hint_y=0.05, color=(0.5, 0.5, 0.5, 1))
        layout.add_widget(self.status)
        
        # WebView for chat
        self.webview = WebView(size_hint_y=0.6)
        layout.add_widget(self.webview)
        
        return layout
    
    def connect_server(self, instance):
        ip = self.ip_input.text.strip()
        if ip:
            self.status.text = f"Connecting to {ip}..."
            # Load the chat interface
            html = f'''
            <html>
            <head>
                <style>
                    body {{ background: #1a1a2e; color: white; font-family: sans-serif; padding: 20px; }}
                    h2 {{ color: #e94560; }}
                    .msg {{ padding: 10px; margin: 5px 0; border-radius: 10px; }}
                    .user {{ background: #e94560; text-align: right; }}
                    .ai {{ background: #2a2a4a; }}
                </style>
            </head>
            <body>
                <h2>🤖 SmartGuide AI</h2>
                <p>Connected to: {ip}</p>
                <div id="chat"></div>
                <script>
                    var ws = new WebSocket("ws://{ip}:8765");
                    ws.onopen = function() {{
                        document.getElementById("chat").innerHTML += '<div class="msg ai">Connected! ✅</div>';
                    }};
                    ws.onmessage = function(e) {{
                        var data = JSON.parse(e.data);
                        if(data.explanation) {{
                            document.getElementById("chat").innerHTML += '<div class="msg ai">' + data.explanation + '</div>';
                        }}
                    }};
                    function sendQuery(q) {{
                        ws.send(JSON.stringify({{type:"query", query:q, context:{{}}, software:"general"}}));
                        document.getElementById("chat").innerHTML += '<div class="msg user">' + q + '</div>';
                    }}
                </script>
                <br>
                <input type="text" id="input" placeholder="Type command..." style="width:70%;padding:10px;border-radius:10px;border:none;">
                <button onclick="sendQuery(document.getElementById('input').value)" style="padding:10px 20px;background:#e94560;color:white;border:none;border-radius:10px;">Send</button>
            </body>
            </html>
            '''
            self.webview.load_html(html)
            self.status.text = f"Connected to {ip}"
        else:
            self.status.text = "Please enter IP address"

if __name__ == "__main__":
    SmartGuideApp().run()
