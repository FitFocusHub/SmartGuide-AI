package com.fitfocushub.smartguide;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.widget.EditText;
import android.widget.Button;
import android.widget.TextView;
import android.widget.LinearLayout;

public class MainActivity extends Activity {
    
    private WebView webView;
    private EditText ipInput;
    private Button connectBtn;
    private TextView statusText;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Fullscreen
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        
        // Create UI
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setBackgroundColor(0xFF1A1A2E);
        layout.setPadding(40, 60, 40, 40);
        
        // Title
        TextView title = new TextView(this);
        title.setText("🤖 SmartGuide AI");
        title.setTextSize(28);
        title.setTextColor(0xFFE94560);
        title.setGravity(android.view.Gravity.CENTER);
        layout.addView(title);
        
        // Subtitle
        TextView subtitle = new TextView(this);
        subtitle.setText("Real-time AI Guidance");
        subtitle.setTextSize(12);
        subtitle.setTextColor(0xFF888888);
        subtitle.setGravity(android.view.Gravity.CENTER);
        LinearLayout.LayoutParams subParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        subParams.setMargins(0, 10, 0, 40);
        subtitle.setLayoutParams(subParams);
        layout.addView(subtitle);
        
        // IP Input
        ipInput = new EditText(this);
        ipInput.setHint("Enter PC IP (e.g., 192.168.1.100)");
        ipInput.setTextSize(14);
        ipInput.setTextColor(0xFFFFFFFF);
        ipInput.setBackgroundColor(0xFF2A2A4A);
        ipInput.setPadding(30, 25, 30, 25);
        LinearLayout.LayoutParams ipParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        ipParams.setMargins(0, 0, 0, 20);
        ipInput.setLayoutParams(ipParams);
        layout.addView(ipInput);
        
        // Connect Button
        connectBtn = new Button(this);
        connectBtn.setText("Connect");
        connectBtn.setTextSize(14);
        connectBtn.setTextColor(0xFFFFFFFF);
        connectBtn.setBackgroundColor(0xFFE94560);
        LinearLayout.LayoutParams btnParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            120
        );
        btnParams.setMargins(0, 0, 0, 15);
        connectBtn.setLayoutParams(btnParams);
        connectBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                connectToServer();
            }
        });
        layout.addView(connectBtn);
        
        // Status
        statusText = new TextView(this);
        statusText.setText("Enter IP and tap Connect");
        statusText.setTextSize(11);
        statusText.setTextColor(0xFF666666);
        statusText.setGravity(android.view.Gravity.CENTER);
        LinearLayout.LayoutParams statusParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        statusParams.setMargins(0, 0, 0, 20);
        statusText.setLayoutParams(statusParams);
        layout.addView(statusText);
        
        // WebView
        webView = new WebView(this);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        LinearLayout.LayoutParams webParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            0, 1.0f
        );
        webView.setLayoutParams(webParams);
        webView.setBackgroundColor(0xFF0A0A1A);
        layout.addView(webView);
        
        setContentView(layout);
    }
    
    private void connectToServer() {
        String ip = ipInput.getText().toString().trim();
        if (ip.isEmpty()) {
            statusText.setText("Please enter IP address");
            return;
        }
        
        statusText.setText("Connecting to " + ip + "...");
        
        String html = "<!DOCTYPE html>" +
            "<html><head><meta name='viewport' content='width=device-width,initial-scale=1'>" +
            "<style>" +
            "*{margin:0;padding:0;box-sizing:border-box;}" +
            "body{background:#0a0a1a;color:#fff;font-family:sans-serif;padding:15px;}" +
            ".header{background:linear-gradient(135deg,#e94560,#0f3460);padding:15px;border-radius:12px;text-align:center;margin-bottom:15px;}" +
            ".header h2{font-size:18px;}" +
            ".chat{display:flex;flex-direction:column;gap:8px;margin-bottom:15px;min-height:200px;}" +
            ".msg{padding:12px;border-radius:15px;max-width:85%;font-size:13px;line-height:1.4;}" +
            ".user{align-self:flex-end;background:linear-gradient(135deg,#e94560,#0f3460);border-bottom-right-radius:4px;}" +
            ".ai{align-self:flex-start;background:#1a1a2e;border-bottom-left-radius:4px;}" +
            ".input-area{display:flex;gap:8px;}" +
            "input{flex:1;padding:12px;border:none;border-radius:25px;background:#1a1a2e;color:#fff;font-size:14px;}" +
            "button{padding:12px 20px;border:none;border-radius:25px;background:#e94560;color:#fff;font-size:14px;}" +
            ".quick{display:flex;gap:6px;overflow-x:auto;padding:10px 0;}" +
            ".quick button{padding:8px 12px;font-size:11px;border-radius:15px;background:#1a1a2e;color:#e94560;border:1px solid #e94560;white-space:nowrap;}" +
            "</style></head><body>" +
            "<div class='header'><h2>🤖 SmartGuide AI</h2><p style='font-size:11px;opacity:0.9'>Connected to: " + ip + "</p></div>" +
            "<div class='chat' id='chat'><div class='msg ai'>Connected! Type a command below.</div></div>" +
            "<div class='quick'>" +
            "<button onclick=\"send('Notepad kholo')\">📝 Notepad</button>" +
            "<button onclick=\"send('Excel kholo')\">📊 Excel</button>" +
            "<button onclick=\"send('Chrome kholo')\">🌐 Chrome</button>" +
            "<button onclick=\"send('WhatsApp kholo')\">💬 WhatsApp</button>" +
            "</div>" +
            "<div class='input-area'>" +
            "<input type='text' id='input' placeholder='Type command...'>" +
            "<button onclick='sendMsg()'>➤</button>" +
            "</div>" +
            "<script>" +
            "var ws;" +
            "function connect(){" +
            "ws=new WebSocket('ws://" + ip + ":8765');" +
            "ws.onopen=function(){" +
            "addMsg('Server connected! ✅','ai');" +
            "statusText.textContent='Connected';" +
            "};" +
            "ws.onmessage=function(e){" +
            "var d=JSON.parse(e.data);" +
            "if(d.explanation)addMsg(d.explanation,'ai');" +
            "if(d.error)addMsg(d.error,'error');" +
            "};" +
            "ws.onerror=function(){" +
            "addMsg('Connection failed! Check IP and server.','error');" +
            "};" +
            "}" +
            "function addMsg(t,c){" +
            "var d=document.createElement('div');" +
            "d.className='msg '+(c||'ai');" +
            "d.textContent=t;" +
            "document.getElementById('chat').appendChild(d);" +
            "document.getElementById('chat').scrollTop=999999;" +
            "}" +
            "function send(t){" +
            "addMsg(t,'user');" +
            "if(ws&&ws.readyState==1){" +
            "ws.send(JSON.stringify({type:'query',query:t,context:{},software:'general'}));" +
            "}else addMsg('Not connected!','error');" +
            "}" +
            "function sendMsg(){" +
            "var v=document.getElementById('input').value.trim();" +
            "if(v){send(v);document.getElementById('input').value='';}" +
            "}" +
            "document.getElementById('input').addEventListener('keypress',function(e){" +
            "if(e.key=='Enter')sendMsg();" +
            "});" +
            "connect();" +
            "</script></body></html>";
        
        webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
        statusText.setText("Connected to " + ip);
    }
}
