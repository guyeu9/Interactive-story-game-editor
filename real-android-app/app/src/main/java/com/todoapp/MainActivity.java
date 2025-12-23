package com.todoapp;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;

public class MainActivity extends Activity {
    
    private WebView webView;
    private ProgressBar progressBar;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        webView = findViewById(R.id.webview);
        progressBar = findViewById(R.id.progressBar);
        
        setupWebView();
        loadTodoApp();
    }
    
    private void setupWebView() {
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAppCacheEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
            }
        });
    }
    
    private void loadTodoApp() {
        String htmlContent = getTodoAppHtml();
        webView.loadDataWithBaseURL("file:///android_asset/", htmlContent, "text/html", "UTF-8", null);
    }
    
    private String getTodoAppHtml() {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"zh-CN\">\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <title>待办事项</title>\n" +
                "    <style>\n" +
                "        * { margin: 0; padding: 0; box-sizing: border-box; }\n" +
                "        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }\n" +
                "        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }\n" +
                "        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }\n" +
                "        .header h1 { font-size: 24px; font-weight: bold; }\n" +
                "        .input-section { padding: 20px; border-bottom: 1px solid #eee; }\n" +
                "        .input-group { display: flex; gap: 10px; }\n" +
                "        input { flex: 1; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; }\n" +
                "        input:focus { outline: none; border-color: #1e40af; }\n" +
                "        button { background: #1e40af; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold; }\n" +
                "        button:hover { background: #1e3a8a; }\n" +
                "        .todo-list { max-height: 400px; overflow-y: auto; }\n" +
                "        .todo-item { display: flex; align-items: center; padding: 15px 20px; border-bottom: 1px solid #eee; }\n" +
                "        .todo-item:last-child { border-bottom: none; }\n" +
                "        .todo-checkbox { width: 20px; height: 20px; border: 2px solid #1e40af; border-radius: 4px; margin-right: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; }\n" +
                "        .todo-checkbox.checked { background: #1e40af; }\n" +
                "        .todo-checkbox.checked::after { content: '✓'; color: white; font-size: 14px; }\n" +
                "        .todo-text { flex: 1; font-size: 16px; color: #333; }\n" +
                "        .todo-text.completed { text-decoration: line-through; color: #888; }\n" +
                "        .delete-btn { background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; }\n" +
                "        .delete-btn:hover { background: #dc2626; }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"container\">\n" +
                "        <div class=\"header\">\n" +
                "            <h1>待办事项</h1>\n" +
                "        </div>\n" +
                "        <div class=\"input-section\">\n" +
                "            <div class=\"input-group\">\n" +
                "                <input type=\"text\" id=\"todoInput\" placeholder=\"输入待办事项...\" />\n" +
                "                <button onclick=\"addTodo()\">添加</button>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "        <div class=\"todo-list\" id=\"todoList\"></div>\n" +
                "    </div>\n" +
                "    <script>\n" +
                "        let todos = JSON.parse(localStorage.getItem('todos')) || [];\n" +
                "        function renderTodos() {\n" +
                "            const todoList = document.getElementById('todoList');\n" +
                "            todoList.innerHTML = '';\n" +
                "            todos.forEach((todo, index) => {\n" +
                "                const todoItem = document.createElement('div');\n" +
                "                todoItem.className = 'todo-item';\n" +
                "                todoItem.innerHTML = '<div class=\"todo-checkbox ' + (todo.completed ? 'checked' : '') + '\" onclick=\"toggleTodo(' + index + ')\"></div><div class=\"todo-text ' + (todo.completed ? 'completed' : '') + '\">' + todo.text + '</div><button class=\"delete-btn\" onclick=\"deleteTodo(' + index + ')\">删除</button>';\n" +
                "                todoList.appendChild(todoItem);\n" +
                "            });\n" +
                "            localStorage.setItem('todos', JSON.stringify(todos));\n" +
                "        }\n" +
                "        function addTodo() {\n" +
                "            const input = document.getElementById('todoInput');\n" +
                "            const text = input.value.trim();\n" +
                "            if (text) {\n" +
                "                todos.push({ text, completed: false });\n" +
                "                input.value = '';\n" +
                "                renderTodos();\n" +
                "            }\n" +
                "        }\n" +
                "        function toggleTodo(index) {\n" +
                "            todos[index].completed = !todos[index].completed;\n" +
                "            renderTodos();\n" +
                "        }\n" +
                "        function deleteTodo(index) {\n" +
                "            todos.splice(index, 1);\n" +
                "            renderTodos();\n" +
                "        }\n" +
                "        document.getElementById('todoInput').addEventListener('keypress', function(e) { if (e.key === 'Enter') { addTodo(); } });\n" +
                "        renderTodos();\n" +
                "    </script>\n" +
                "</body>\n" +
                "</html>";
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