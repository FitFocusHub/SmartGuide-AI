package com.fitfocushub.smartguide;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.JavascriptInterface;
import android.os.Handler;
import android.os.Looper;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    
    private WebView webView;
    private ExecutorService executor = Executors.newSingleThreadExecutor();
    private Handler mainHandler = new Handler(Looper.getMainLooper());
    private String API_KEY;
    private static final String API_URL = "https://api.groq.com/openai/v1/chat/completions";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        API_KEY = BuildConfig.GROQ_API_KEY;
        
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        
        webView = new WebView(this);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new WebAppInterface(), "Android");
        webView.setBackgroundColor(0xFF0A0A1A);
        setContentView(webView);
        
        loadChatUI();
    }
    
    private void loadChatUI() {
        String html = "<!DOCTYPE html>" +
            "<html><head><meta name='viewport' content='width=device-width,initial-scale=1,maximum-scale=1'>" +
            "<style>" +
            "*{margin:0;padding:0;box-sizing:border-box;}" +
            "body{background:#0a0a1a;color:#fff;font-family:sans-serif;padding:15px;padding-top:50px;}" +
            ".header{background:linear-gradient(135deg,#e94560,#0f3460);padding:15px;border-radius:12px;text-align:center;margin-bottom:15px;position:fixed;top:0;left:0;right:0;z-index:10;}" +
            ".header h2{font-size:18px;}" +
            ".header p{font-size:10px;opacity:0.8;margin-top:3px;}" +
            ".chat{display:flex;flex-direction:column;gap:8px;margin-bottom:15px;min-height:300px;}" +
            ".msg{padding:12px;border-radius:15px;max-width:85%;font-size:13px;line-height:1.5;word-wrap:break-word;}" +
            ".user{align-self:flex-end;background:linear-gradient(135deg,#e94560,#0f3460);border-bottom-right-radius:4px;}" +
            ".ai{align-self:flex-start;background:#1a1a2e;border-bottom-left-radius:4px;white-space:pre-wrap;}" +
            ".typing{align-self:flex-start;background:#1a1a2e;padding:12px;border-radius:15px;}" +
            ".typing span{display:inline-block;width:8px;height:8px;background:#e94560;border-radius:50%;margin:0 2px;animation:bounce 1.4s infinite;}" +
            ".typing span:nth-child(2){animation-delay:0.2s;}" +
            ".typing span:nth-child(3){animation-delay:0.4s;}" +
            "@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}}" +
            ".quick{display:flex;gap:6px;overflow-x:auto;padding:10px 0;margin-bottom:10px;}" +
            ".quick button{padding:8px 12px;font-size:11px;border-radius:15px;background:#1a1a2e;color:#e94560;border:1px solid #e94560;white-space:nowrap;cursor:pointer;}" +
            ".input-area{display:flex;gap:8px;position:fixed;bottom:0;left:0;right:0;padding:12px 15px;background:#0a0a1a;border-top:1px solid #1a1a2e;}" +
            "input{flex:1;padding:12px;border:none;border-radius:25px;background:#1a1a2e;color:#fff;font-size:14px;outline:none;}" +
            "button.send{padding:12px 20px;border:none;border-radius:25px;background:#e94560;color:#fff;font-size:14px;cursor:pointer;}" +
            ".powered{position:fixed;bottom:60px;left:0;right:0;text-align:center;font-size:9px;color:#333;}" +
            "</style></head><body>" +
            "<div class='header'><h2>SmartGuide AI</h2><p>Standalone - No PC needed</p></div>" +
            "<div class='chat' id='chat'>" +
            "<div class='msg ai'>Hi! Main SmartGuide AI hoon. Mujhe kuch bhi poochho - koi bhi software, app, ya kaam. Mai aapki help karunga!</div>" +
            "</div>" +
            "<div class='quick'>" +
            "<button onclick=\"send('Notepad kaise khole')\">Notepad</button>" +
            "<button onclick=\"send('Excel seekho')\">Excel</button>" +
            "<button onclick=\"send('YouTube shortcuts batao')\">YouTube</button>" +
            "<button onclick=\"send('CapCut edit kaise kare')\">CapCut</button>" +
            "</div>" +
            "<div class='powered'>Powered by Groq AI</div>" +
            "<div class='input-area'>" +
            "<input type='text' id='input' placeholder='Kuch bhi poochho...'>" +
            "<button class='send' onclick='sendMsg()'>Send</button>" +
            "</div>" +
            "<script>" +
            "var typing=false;" +
            "function addMsg(t,c){" +
            "var d=document.createElement('div');" +
            "d.className='msg '+(c||'ai');" +
            "d.textContent=t;" +
            "document.getElementById('chat').appendChild(d);" +
            "document.getElementById('chat').scrollTop=999999;" +
            "}" +
            "function showTyping(){" +
            "var d=document.createElement('div');" +
            "d.className='typing';d.id='typing';" +
            "d.innerHTML='<span></span><span></span><span></span>';" +
            "document.getElementById('chat').appendChild(d);" +
            "document.getElementById('chat').scrollTop=999999;" +
            "}" +
            "function hideTyping(){" +
            "var t=document.getElementById('typing');" +
            "if(t)t.remove();" +
            "}" +
            "function send(t){" +
            "if(typing)return;" +
            "addMsg(t,'user');" +
            "showTyping();" +
            "typing=true;" +
            "Android.askAI(t);" +
            "}" +
            "function sendMsg(){" +
            "var v=document.getElementById('input').value.trim();" +
            "if(v){send(v);document.getElementById('input').value='';}" +
            "}" +
            "function onResponse(r){" +
            "hideTyping();" +
            "typing=false;" +
            "addMsg(r,'ai');" +
            "}" +
            "document.getElementById('input').addEventListener('keypress',function(e){" +
            "if(e.key=='Enter')sendMsg();" +
            "});" +
            "</script></body></html>";
        
        webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
    }
    
    public class WebAppInterface {
        @JavascriptInterface
        public void askAI(String query) {
            executor.execute(() -> {
                try {
                    String response = callGroqAPI(query);
                    mainHandler.post(() -> {
                        webView.evaluateJavascript("onResponse('" + escapeJS(response) + "')", null);
                    });
                } catch (Exception e) {
                    mainHandler.post(() -> {
                        webView.evaluateJavascript("onResponse('Error: " + escapeJS(e.getMessage()) + "')", null);
                    });
                }
            });
        }
    }
    
    private String callGroqAPI(String query) throws Exception {
        String prompt = "Tu SmartGuide AI hai. Tu Hinglish mein jawab deta hai. " +
            "Har software ke liye step-by-step guide deta hai. " +
            "Keyboard shortcuts bhi batata hai. " +
            "Chhote aur simple jawab de.\n\n" +
            "User ka sawal: " + query;
        
        String jsonBody = "{" +
            "\"model\":\"llama-3.3-70b-versatile\"," +
            "\"messages\":[{\"role\":\"user\",\"content\":\"" + escapeJSON(prompt) + "\"}]," +
            "\"max_tokens\":500," +
            "\"temperature\":0.7" +
            "}";
        
        URL url = new URL(API_URL);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer " + API_KEY);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(30000);
        conn.setReadTimeout(30000);
        
        OutputStream os = conn.getOutputStream();
        os.write(jsonBody.getBytes("UTF-8"));
        os.close();
        
        int responseCode = conn.getResponseCode();
        
        BufferedReader reader;
        if (responseCode == 200) {
            reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        } else {
            reader = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
        }
        
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        reader.close();
        conn.disconnect();
        
        String response = sb.toString();
        
        if (responseCode != 200) {
            return "API Error (" + responseCode + "). Baad mein try karo.";
        }
        
        int idx = response.indexOf("\"content\":\"");
        if (idx > -1) {
            String content = response.substring(idx + 11);
            int end = content.indexOf("\"");
            if (end > -1) {
                content = content.substring(0, end);
                content = content.replace("\\n", "\n").replace("\\t", "\t");
                content = content.replace("\\\"", "\"").replace("\\\\", "\\");
                return content;
            }
        }
        
        return "Jawab mil gaya lekin parse nahi ho paya.";
    }
    
    private String escapeJSON(String s) {
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "")
                .replace("\t", "\\t");
    }
    
    private String escapeJS(String s) {
        return s.replace("\\", "\\\\")
                .replace("'", "\\'")
                .replace("\n", "\\n")
                .replace("\r", "")
                .replace("\t", "\\t");
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
