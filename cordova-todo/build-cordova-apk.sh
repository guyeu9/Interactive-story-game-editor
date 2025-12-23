#!/bin/bash

echo "=== 使用Cordova构建APK ==="

cd /workspace/projects
mkdir -p cordova-todo && cd cordova-todo

# 检查npm是否可用
if ! command -v npm &> /dev/null; then
    echo "npm不可用，跳过Cordova构建"
    exit 1
fi

# 安装Cordova CLI
npm install -g cordova

# 创建Cordova项目
if [ ! -d "todo-cordova" ]; then
    cordova create todo-cordova com.todoapp SimpleTodo
fi

cd todo-cordova

# 添加Android平台
cordova platform add android

# 创建待办事项HTML应用
mkdir -p www
cat > www/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>待办事项</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: #f5f5f5; 
            padding: 20px; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            overflow: hidden; 
        }
        .header { 
            background: #1e40af; 
            color: white; 
            padding: 20px; 
            text-align: center; 
        }
        .header h1 { 
            font-size: 24px; 
            font-weight: bold; 
        }
        .input-section { 
            padding: 20px; 
            border-bottom: 1px solid #eee; 
        }
        .input-group { 
            display: flex; 
            gap: 10px; 
        }
        input { 
            flex: 1; 
            padding: 12px; 
            border: 2px solid #ddd; 
            border-radius: 8px; 
            font-size: 16px; 
        }
        input:focus { 
            outline: none; 
            border-color: #1e40af; 
        }
        button { 
            background: #1e40af; 
            color: white; 
            border: none; 
            padding: 12px 20px; 
            border-radius: 8px; 
            font-size: 16px; 
            cursor: pointer; 
            font-weight: bold; 
        }
        button:hover { 
            background: #1e3a8a; 
        }
        .todo-list { 
            max-height: 400px; 
            overflow-y: auto; 
        }
        .todo-item { 
            display: flex; 
            align-items: center; 
            padding: 15px 20px; 
            border-bottom: 1px solid #eee; 
        }
        .todo-item:last-child { 
            border-bottom: none; 
        }
        .todo-checkbox { 
            width: 20px; 
            height: 20px; 
            border: 2px solid #1e40af; 
            border-radius: 4px; 
            margin-right: 12px; 
            cursor: pointer; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
        }
        .todo-checkbox.checked { 
            background: #1e40af; 
        }
        .todo-checkbox.checked::after { 
            content: '✓'; 
            color: white; 
            font-size: 14px; 
        }
        .todo-text { 
            flex: 1; 
            font-size: 16px; 
            color: #333; 
        }
        .todo-text.completed { 
            text-decoration: line-through; 
            color: #888; 
        }
        .delete-btn { 
            background: #ef4444; 
            color: white; 
            border: none; 
            padding: 6px 12px; 
            border-radius: 4px; 
            font-size: 12px; 
            cursor: pointer; 
        }
        .delete-btn:hover { 
            background: #dc2626; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>待办事项</h1>
        </div>
        <div class="input-section">
            <div class="input-group">
                <input type="text" id="todoInput" placeholder="输入待办事项..." />
                <button onclick="addTodo()">添加</button>
            </div>
        </div>
        <div class="todo-list" id="todoList"></div>
    </div>

    <script>
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        
        function renderTodos() {
            const todoList = document.getElementById('todoList');
            todoList.innerHTML = '';
            
            todos.forEach((todo, index) => {
                const todoItem = document.createElement('div');
                todoItem.className = 'todo-item';
                todoItem.innerHTML = 
                    '<div class="todo-checkbox ' + (todo.completed ? 'checked' : '') + '" onclick="toggleTodo(' + index + ')"></div>' +
                    '<div class="todo-text ' + (todo.completed ? 'completed' : '') + '">' + todo.text + '</div>' +
                    '<button class="delete-btn" onclick="deleteTodo(' + index + ')">删除</button>';
                todoList.appendChild(todoItem);
            });
            
            localStorage.setItem('todos', JSON.stringify(todos));
        }
        
        function addTodo() {
            const input = document.getElementById('todoInput');
            const text = input.value.trim();
            
            if (text) {
                todos.push({ text, completed: false });
                input.value = '';
                renderTodos();
            }
        }
        
        function toggleTodo(index) {
            todos[index].completed = !todos[index].completed;
            renderTodos();
        }
        
        function deleteTodo(index) {
            todos.splice(index, 1);
            renderTodos();
        }
        
        // 添加回车键支持
        document.getElementById('todoInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTodo();
            }
        });
        
        // 初始化渲染
        renderTodos();
    </script>
</body>
</html>
EOF

echo "Cordova项目已准备就绪"
echo "下一步："
echo "1. cd /workspace/projects/cordova-todo/todo-cordova"
echo "2. cordova build android" 
echo "3. APK文件将在 platforms/android/app/build/outputs/apk/debug/ 中生成"