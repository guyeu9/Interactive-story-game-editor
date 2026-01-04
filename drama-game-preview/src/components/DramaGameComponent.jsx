import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Layers, 
  Zap, 
  Play, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  FileText,
  X,
  ListPlus,
  History,
  HardDrive,
  AlertTriangle,
  MapPin,
  Save,
  Flag,
  Copy, 
  Check, 
  Link, 
  Share2, 
  MessageSquare,
  Bug,
  FileSearch
} from 'lucide-react';
import { logger, logUserAction, logDataChange, logError, logPerformance } from '../utils/logger';
import LogViewer from './LogViewer';

/**
 * ------------------------------------------------------------------
 * 剧情织造机 (Text Game Weaver) V1.3.20
 * 更新日志：
 * - [修复] 模态框层级：修复点击历史记录删除按钮时，删除确认模态框被历史记录模态框遮挡的问题。
 * - [优化] Modal 组件：增加 zIndex 属性，允许灵活控制层级。
 * ------------------------------------------------------------------
 */

// --- 辅助组件：导航按钮 ---
const NavButton = ({ icon: Icon, label, active, onClick, primary }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-14 transition-colors pointer-events-auto ${
      primary
        ? 'text-indigo-600 font-bold -mt-4 bg-indigo-50 rounded-full h-14 w-14 border border-indigo-100 shadow-lg'
        : active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    <Icon size={primary ? 24 : 20} strokeWidth={active || primary ? 2.5 : 2} />
    {!primary && <span className="text-[10px] mt-1 font-medium">{label}</span>}
  </button>
);

// --- 初始演示数据 ---
const INITIAL_LAYERS = [
  { layer_id: "L1_SETUP", layer_name: "开场准备", sequence: 1, worldview: "默认世界观" },
  { layer_id: "L2_CORE", layer_name: "核心解谜", sequence: 2, worldview: "默认世界观" },
  { layer_id: "L3_ENDING", layer_name: "结局判定", sequence: 3, worldview: "默认世界观" }
];

const INITIAL_SCENES = [
  { id: "S001", name: "废弃实验室", description: "充满灰尘和化学试剂味道的房间。", tags: ["恐怖", "解谜", "室内"], worldview: "默认世界观" },
  { id: "S002", name: "中央公园", description: "阳光明媚，但似乎隐藏着危机。", tags: ["开放", "日间", "NPC"], worldview: "默认世界观" },
  // 添加测试世界观数据
  { id: "S003", name: "皇庭南卫星城办公室", description: "宽敞明亮的魔能枪械团团长办公室", tags: ["室内", "办公室", "皇庭"], worldview: "月王故事" },
  { id: "S004", name: "大学体育馆更衣室", description: "大学体育馆更衣室里，空气湿热黏稠", tags: ["室内", "更衣室", "汗臭"], worldview: "王勇和体育生故事" }
];

const INITIAL_PLAYS = [
  { id: "P001", name: "搜寻物资", description: "在角落里翻找，发现了一个急救包。", trigger_condition: "无", result: "获得急救包", fk_layer_id: "L1_SETUP", tags: ["生存"], worldview: "默认世界观" },
  { id: "P002", name: "破解密码锁", description: "玩家需要找到并破解一个三位密码锁。", trigger_condition: "进入实验室", result: "获得核心线索", fk_layer_id: "L2_CORE", tags: ["解谜", "室内"], worldview: "默认世界观" },
  { id: "P003", name: "遭遇野狗", description: "一只野狗挡住了去路。", trigger_condition: "无", result: "战斗或逃跑", fk_layer_id: "L2_CORE", tags: ["开放", "战斗"], worldview: "默认世界观" },
  { id: "P004", name: "逃出生天", description: "成功找到了出口。", trigger_condition: "线索集齐", result: "游戏胜利", fk_layer_id: "L3_ENDING", tags: ["结局"], worldview: "默认世界观" }
];

const INITIAL_COMMANDS = [
  { id: "C001", name: "突发地震", description: "地面剧烈摇晃，物品掉落。", probability: 30, scope_type: "LAYER", fk_target_id: "L2_CORE", worldview: "默认世界观" },
  { id: "C002", name: "NPC提供线索", description: "一个流浪汉提供了关键信息。", probability: 50, scope_type: "SCENE", fk_target_id: "S002", worldview: "默认世界观" },
  { id: "C003", name: "天气突变", description: "突然下起了暴雨。", probability: 10, scope_type: "GLOBAL", fk_target_id: "", worldview: "默认世界观" }
];

// --- 辅助组件：Card, Badge, Button, Modal, Snackbar ---

const Card = ({ children, className = "", onClick }) => (
  // 确保 Card 组件支持 onClick 属性，添加 pointer-events 确保可点击
  <div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-3 ${className} pointer-events-auto`}>
    {children}
  </div>
);

const Badge = ({ children, color = "blue", className = "" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${colors[color] || colors.slate} mr-1 ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ children, onClick, variant = "primary", className = "", size = "md", disabled = false, type = "button" }) => {
  const base = "flex items-center justify-center rounded-lg font-medium transition-colors active:scale-95 pointer-events-auto";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-200",
    ghost: "text-slate-500 hover:bg-slate-100",
    lightDanger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
  };
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base w-full",
    icon: "p-2",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

// V1.3.19 修复：Modal 组件增加 zIndex 属性，用于控制层级，解决遮挡问题。
const Modal = ({ isOpen, onClose, title, children, zIndex = 50 }) => {
  if (!isOpen) return null;
  // zIndex 用于背景遮罩，zIndex + 1 用于内容容器，确保内容比背景高一层
  const bgZ = zIndex; 
  const contentZ = zIndex + 1; 

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 pointer-events-auto`} 
      style={{ zIndex: bgZ }}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto flex flex-col pointer-events-auto"
        style={{ zIndex: contentZ }}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 pointer-events-auto">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const Snackbar = ({ message, type = "success", onClose }) => {
  if (!message) return null;
  const bg = type === "error" ? "bg-red-600" : "bg-slate-800";
  return (
    <div className={`fixed bottom-20 left-4 right-4 ${bg} text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center justify-between animate-in slide-in-from-bottom-5 duration-300`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-white/80 hover:text-white"><X size={16}/></button>
    </div>
  );
};

// --- 辅助组件：多选框列表 ---
const CheckboxList = ({ name, options, selectedValues, onChange, required = false }) => {
  // 内部状态用于管理复选框的选中状态
  const [localSelected, setLocalSelected] = useState(selectedValues);

  const handleCheck = (id) => {
    const newSelection = localSelected.includes(id)
      ? localSelected.filter(v => v !== id)
      : [...localSelected, id];
    
    setLocalSelected(newSelection);
    // 通过回调通知父组件更新其状态
    onChange(newSelection);
  };

  // 确保外部状态变化时，内部状态能同步更新 (用于编辑时)
  useEffect(() => {
    // 确保 selectedValues 是一个数组
    if (Array.isArray(selectedValues)) {
        setLocalSelected(selectedValues);
    }
  }, [selectedValues]);


  return (
    <div 
      className="w-full border border-slate-300 rounded-lg p-2 h-40 overflow-y-auto bg-white pointer-events-auto"
    >
      {required && localSelected.length === 0 && (
          <p className="text-xs text-red-500 mb-2">请至少选择一项</p>
      )}
      {options.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-4">暂无可选 {name} 数据</p>
      ) : options.map(opt => (
        <div key={opt.id} className="flex items-center text-sm cursor-pointer hover:bg-slate-50 p-1 rounded pointer-events-auto">
          <input
            type="checkbox"
            id={`${name}-${opt.id}`}
            // 不在 input 上使用 name 属性，而是依赖 onChange 更新父状态，以避免 FormData 的复杂性
            value={opt.id}
            checked={localSelected.includes(opt.id)}
            onChange={() => handleCheck(opt.id)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2 flex-shrink-0 pointer-events-auto"
          />
          <label htmlFor={`${name}-${opt.id}`} className="text-slate-700 select-none flex-1 leading-tight pointer-events-auto">
            {opt.name}
          </label>
        </div>
      ))}
    </div>
  );
};

// --- 主应用组件 ---
export default function TextGameApp() {
  // 全局错误捕获
  useEffect(() => {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    const handleError = (event) => {
      logError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }, {
        component: 'TextGameApp',
        action: 'global_error_handler'
      });
    };

    const handleUnhandledRejection = (event) => {
      logError(event.reason || new Error('Unhandled Promise Rejection'), null, {
        component: 'TextGameApp',
        action: 'unhandled_rejection'
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    logger.info('APP_INIT', '应用初始化完成', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      logger.info('APP_CLEANUP', '应用清理完成');
    };
  }, []);

  // --- 状态管理 ---
  const [activeTab, setActiveTab] = useState("generator");

  const [scenes, setScenes] = useState(INITIAL_SCENES);
  const [layers, setLayers] = useState(INITIAL_LAYERS);
  const [plays, setPlays] = useState(INITIAL_PLAYS);
  const [commands, setCommands] = useState(INITIAL_COMMANDS);

  // V1.3 新增：历史生成记录
  // history item: { timestamp, sceneName, story }
  const [generatedHistory, setGeneratedHistory] = useState([]);

  // UI 交互状态
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add | edit | batch | history | confirm
  const [editingItem, setEditingItem] = useState(null);
  const [targetType, setTargetType] = useState("scene"); // scene | layer | play | command | history
  const [toast, setToast] = useState({ msg: "", type: "success" });

  // V1.3 修复: 删除确认状态 (取代 window.confirm)
  const [confirmingDelete, setConfirmingDelete] = useState(null); // { id, type, name }

  // V1.3.2 新增: 复制状态
  const [copiedId, setCopiedId] = useState(null);

  // V1.3.16 新增: 历史记录标题编辑状态
  const [editingHistoryId, setEditingHistoryId] = useState(null); 
  const [tempHistoryTitle, setTempHistoryTitle] = useState('');

  // 日志查看器状态
  const [showLogViewer, setShowLogViewer] = useState(false);

  // 生成器状态
  const [selectedSceneId, setSelectedSceneId] = useState("");
  const [generatedStory, setGeneratedStory] = useState([]);
  
  // V1.3.7 状态: 用于指令编辑表单
  const [commandScopeType, setCommandScopeType] = useState("GLOBAL"); 
  // V1.3.7 关键状态：用于管理多选框列表的选中值 (SCENE/LAYER)
  const [commandTargetIds, setCommandTargetIds] = useState([]); 

  const [batchText, setBatchText] = useState("");

  // [新增] 批量导入玩法目标层级
  const [batchLayerId, setBatchLayerId] = useState(INITIAL_LAYERS[0]?.layer_id || "");

  // [V1.3.9 新增] 批量导入指令默认作用域
  const [batchCommandScope, setBatchCommandScope] = useState('GLOBAL'); 
  
  // [V1.3.12 关键新增] 批量导入指令默认目标ID (数组，用于 CheckboxList)
  const [batchCommandTargetIdsArray, setBatchCommandTargetIdsArray] = useState([]);
  
  // [新增] 批量导入世界观状态
  const [batchWorldview, setBatchWorldview] = useState("");

  // 新增：剧情走向模式状态
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [interactiveStory, setInteractiveStory] = useState([]);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [selectedCommands, setSelectedCommands] = useState([]);
  const [currentScene, setCurrentScene] = useState(null);
  
  // 新增：候选选项缓存状态，避免重复刷新
  const [candidatePlays, setCandidatePlays] = useState([]);
  const [candidateCommands, setCandidateCommands] = useState([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // 新增：数据保存相关状态
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);

  // [新增] 世界观相关状态
  const [selectedWorldview, setSelectedWorldview] = useState(""); // 选中的世界观
  const [enableWorldviewFilter, setEnableWorldviewFilter] = useState(false); // 是否启用世界观过滤

  // 加强版数据持久化机制
  const STORAGE_KEYS = {
    scenes: 'tg_scenes',
    layers: 'tg_layers', 
    plays: 'tg_plays',
    commands: 'tg_commands',
    history: 'tg_history',
    interactiveMode: 'tg_interactive_mode',
    selectedSceneId: 'tg_selected_scene_id',
    generatedStory: 'tg_generated_story',
    activeTab: 'tg_active_tab',
    selectedWorldview: 'tg_selected_worldview',
    enableWorldviewFilter: 'tg_enable_worldview_filter'
  };

  // 安全的LocalStorage操作函数
  const safeLocalStorage = {
    get: (key, defaultValue = null) => {
      // 检查是否在浏览器环境
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return defaultValue;
      }
      
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error(`LocalStorage读取失败 [${key}]:`, error);
        return defaultValue;
      }
    },
    
    set: (key, value) => {
      // 检查是否在浏览器环境
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return false;
      }
      
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error(`LocalStorage写入失败 [${key}]:`, error);
        // 存储空间满时的处理
        if (error.name === 'QuotaExceededError') {
          showToast("本地存储空间不足，请清理数据", "error");
        }
        return false;
      }
    },
    
    remove: (key) => {
      // 检查是否在浏览器环境
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return false;
      }
      
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error(`LocalStorage删除失败 [${key}]:`, error);
        return false;
      }
    }
  };

  // 数据加载函数（组件初始化时执行）
  const loadPersistedData = () => {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    logger.info('DATA_LOAD', '开始加载数据');
    
    const loadItem = (key, setter, initialValue) => {
      const saved = safeLocalStorage.get(STORAGE_KEYS[key], initialValue);
      if (saved !== null) {
        // 验证数据格式
        if (Array.isArray(saved) && (key === 'scenes' || key === 'layers' || key === 'plays' || key === 'commands' || key === 'history')) {
          setter(saved);
          logger.info('DATA_LOAD', `成功加载${key}`, { count: saved.length });
        } else if (typeof saved === 'string' && (key === 'selectedSceneId' || key === 'activeTab')) {
          setter(saved);
          logger.info('DATA_LOAD', `成功加载${key}`, { value: saved });
        } else if (typeof saved === 'boolean' && key === 'interactiveMode') {
          setter(saved);
          logger.info('DATA_LOAD', `成功加载${key}`, { value: saved });
        } else if (Array.isArray(saved) && key === 'generatedStory') {
          setter(saved);
          logger.info('DATA_LOAD', `成功加载${key}`, { count: saved.length });
        } else {
          logger.warn('DATA_LOAD', `${key}数据格式无效，使用默认值`);
          setter(initialValue);
        }
      } else {
        logger.info('DATA_LOAD', `${key}无保存数据，使用默认值`);
        setter(initialValue);
      }
    };

    // 加载所有持久化数据
    loadItem('scenes', setScenes, INITIAL_SCENES);
    loadItem('layers', setLayers, INITIAL_LAYERS);
    loadItem('plays', setPlays, INITIAL_PLAYS);
    loadItem('commands', setCommands, INITIAL_COMMANDS);
    loadItem('history', setGeneratedHistory, []);
    loadItem('selectedWorldview', setSelectedWorldview, "");
    loadItem('enableWorldviewFilter', setEnableWorldviewFilter, false);
    loadItem('selectedSceneId', setSelectedSceneId, "");
    loadItem('activeTab', setActiveTab, "generator");
    loadItem('generatedStory', setGeneratedStory, []);
    
    // 恢复剧情走向模式（可选）
    const savedInteractiveMode = safeLocalStorage.get(STORAGE_KEYS.interactiveMode, false);
    if (savedInteractiveMode) {
      // 清理剧情走向模式状态，避免异常
      setInteractiveMode(false);
      setCurrentLayerIndex(0);
      setInteractiveStory([]);
      setSelectedChoices([]);
      setSelectedCommands([]);
      setCurrentScene(null);
      logger.info('DATA_LOAD', '清理剧情走向模式状态');
    }

    // [关键修复] 检查并修复重复ID问题
    const analyzeIds = (items, idKey, type) => {
      const ids = items.map(item => item[idKey]);
      const uniqueIds = new Set(ids);
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      const hasDuplicates = ids.length !== uniqueIds.size;
      
      if (hasDuplicates) {
        logger.warn('DATA_ANALYSIS', `发现${type}数据重复ID`, {
          totalCount: items.length,
          uniqueCount: uniqueIds.size,
          duplicateCount: duplicates.length,
          duplicates: [...new Set(duplicates)],
          allIds: ids
        });
      } else {
        logger.info('DATA_ANALYSIS', `${type}数据ID检查通过`, {
          totalCount: items.length,
          uniqueCount: uniqueIds.size
        });
      }
      
      return { hasDuplicates, duplicates };
    };

    // 分析所有数据类型的ID情况
    const scenesAnalysis = analyzeIds(scenes, 'id', '场景');
    const layersAnalysis = analyzeIds(layers, 'layer_id', '层级');
    const playsAnalysis = analyzeIds(plays, 'id', '玩法');
    const commandsAnalysis = analyzeIds(commands, 'id', '指令');

    const needsIdFix = scenesAnalysis.hasDuplicates || 
                         layersAnalysis.hasDuplicates || 
                         playsAnalysis.hasDuplicates || 
                         commandsAnalysis.hasDuplicates;

    if (needsIdFix) {
      logger.warn('DATA_LOAD', '检测到重复ID，开始修复...', {
        scenes: { count: scenes.length, hasDuplicates: scenesAnalysis.hasDuplicates },
        layers: { count: layers.length, hasDuplicates: layersAnalysis.hasDuplicates },
        plays: { count: plays.length, hasDuplicates: playsAnalysis.hasDuplicates },
        commands: { count: commands.length, hasDuplicates: commandsAnalysis.hasDuplicates }
      });

      const fixedData = fixDuplicateIds({
        scenes,
        layers,
        plays,
        commands
      });

      setScenes(fixedData.scenes);
      setLayers(fixedData.layers);
      setPlays(fixedData.plays);
      setCommands(fixedData.commands);

      logger.info('DATA_LOAD', '重复ID修复完成', {
        fixedScenesCount: fixedData.scenes.length,
        fixedLayersCount: fixedData.layers.length,
        fixedPlaysCount: fixedData.plays.length,
        fixedCommandsCount: fixedData.commands.length
      });

      console.log('ID修复完成，数据已更新');
      showToast('检测到数据ID重复问题，已自动修复', 'success');
    }

    // 记录最终的数据状态
    logger.info('DATA_LOAD', '数据加载完成', {
      scenesCount: scenes.length,
      layersCount: layers.length,
      playsCount: plays.length,
      commandsCount: commands.length,
      selectedWorldview,
      enableWorldviewFilter,
      selectedSceneId,
      activeTab
    });

    setLastSaveTime(Date.now());
    console.log('数据加载完成');
  };

  // 数据加载后验证场景和世界观的一致性
  useEffect(() => {
    // 如果启用了世界观筛选且有选中的世界观和场景，验证一致性
    if (enableWorldviewFilter && selectedWorldview && selectedSceneId) {
      const scene = scenes.find(s => s.id === selectedSceneId);
      if (scene && scene.worldview !== selectedWorldview) {
        // 场景与当前世界观不匹配，重置场景选择
        console.log(`场景"${scene.name}"与当前世界观"${selectedWorldview}"不匹配，重置场景选择`);
        setSelectedSceneId("");
        showToast(`场景"${scene.name}"不属于当前世界观"${selectedWorldview}"，已自动重置选择`, "warning");
      }
    }
  }, [scenes, selectedWorldview, selectedSceneId, enableWorldviewFilter]);

  // 防抖保存函数
  const debouncedSave = (() => {
    let timeoutId = null;
    return (data, key) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (safeLocalStorage.set(STORAGE_KEYS[key], data)) {
          setLastSaveTime(Date.now());
          console.log(`自动保存 ${key} 成功`);
        }
      }, 500); // 500ms防抖延迟
    };
  })();

  // 批量保存所有数据
  const saveAllData = () => {
    if (isSaving) return;
    
    setIsSaving(true);
    const success = {
      scenes: safeLocalStorage.set(STORAGE_KEYS.scenes, scenes),
      layers: safeLocalStorage.set(STORAGE_KEYS.layers, layers),
      plays: safeLocalStorage.set(STORAGE_KEYS.plays, plays),
      commands: safeLocalStorage.set(STORAGE_KEYS.commands, commands),
      history: safeLocalStorage.set(STORAGE_KEYS.history, generatedHistory),
      selectedSceneId: safeLocalStorage.set(STORAGE_KEYS.selectedSceneId, selectedSceneId),
      activeTab: safeLocalStorage.set(STORAGE_KEYS.activeTab, activeTab),
      generatedStory: safeLocalStorage.set(STORAGE_KEYS.generatedStory, generatedStory),
      selectedWorldview: safeLocalStorage.set(STORAGE_KEYS.selectedWorldview, selectedWorldview),
      enableWorldviewFilter: safeLocalStorage.set(STORAGE_KEYS.enableWorldviewFilter, enableWorldviewFilter)
    };

    const allSuccess = Object.values(success).every(Boolean);
    if (allSuccess) {
      setLastSaveTime(Date.now());
      console.log('所有数据保存成功');
    } else {
      showToast("部分数据保存失败", "error");
    }
    
    setIsSaving(false);
    return allSuccess;
  };

  // 清理所有数据
  const clearAllData = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      safeLocalStorage.remove(key);
    });
    setLastSaveTime(null);
    console.log('所有本地数据已清理');
  };

  // 初始化时加载数据
  useEffect(() => {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    loadPersistedData();
  }, []);

  // 页面卸载时保存数据
  useEffect(() => {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const handleBeforeUnload = (e) => {
      saveAllData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveAllData();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [scenes, layers, plays, commands, generatedHistory, selectedSceneId, activeTab, generatedStory, selectedWorldview, enableWorldviewFilter]);

  // 主要数据变化时的自动保存（使用防抖）
  useEffect(() => {
    if (lastSaveTime) { // 避免初始化时的触发
      debouncedSave(scenes, 'scenes');
    }
  }, [scenes]);

  useEffect(() => {
    if (lastSaveTime) {
      debouncedSave(layers, 'layers');
    }
  }, [layers]);

  useEffect(() => {
    if (lastSaveTime) {
      debouncedSave(plays, 'plays');
    }
  }, [plays]);

  useEffect(() => {
    if (lastSaveTime) {
      debouncedSave(commands, 'commands');
    }
  }, [commands]);

  useEffect(() => {
    if (lastSaveTime) {
      debouncedSave(generatedHistory, 'history');
    }
  }, [generatedHistory]);

  // UI状态的即时保存
  useEffect(() => {
    if (lastSaveTime) {
      safeLocalStorage.set(STORAGE_KEYS.selectedSceneId, selectedSceneId);
    }
  }, [selectedSceneId]);

  useEffect(() => {
    if (lastSaveTime) {
      safeLocalStorage.set(STORAGE_KEYS.activeTab, activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (lastSaveTime) {
      safeLocalStorage.set(STORAGE_KEYS.generatedStory, generatedStory);
    }
  }, [generatedStory]);

  // 定期保存（每30秒）
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSaving) {
        saveAllData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [scenes, layers, plays, commands, generatedHistory, selectedSceneId, activeTab, generatedStory, isSaving]);

  // 剧情走向模式的效果钩子：用于控制候选选项的加载
  useEffect(() => {
    if (interactiveMode && isFirstLoad && currentScene) {
      const { plays, commands } = getCandidatesForCurrentLayer(currentScene, currentLayerIndex);
      setCandidatePlays(plays);
      setCandidateCommands(commands);
      setIsFirstLoad(false);
    }
  }, [currentLayerIndex, interactiveMode, isFirstLoad, currentScene]);

  // --- 工具函数 ---
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    // 2秒后自动清除 toast
    setTimeout(() => setToast({ msg: "", type: "success" }), 2000);
  };

  const generateId = (prefix) => {
    return `${prefix}${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 8)}`;
  };

  // 新增：中文转拼音首字母函数
  const chineseToFirstLetters = (chineseStr) => {
    const pinyinMap = {
      '废': 'F', '弃': 'Q', '实': 'S', '验': 'Y', '室': 'S', '中': 'Z', '央': 'Y', 
      '公': 'G', '园': 'Y', '图': 'T', '书': 'S', '馆': 'G', '商': 'S', '店': 'D',
      '学': 'X', '校': 'X', '教': 'J', '堂': 'T', '医': 'Y', '院': 'Y', '派': 'P',
      '出': 'C', '所': 'S', '警': 'J', '察': 'C', '局': 'J', '银': 'Y', '行': 'H',
      '车': 'C', '站': 'Z', '机': 'J', '场': 'C', '码': 'M', '头': 'T', '港': 'G',
      '市': 'S', '政': 'Z', '府': 'F', '体': 'T', '育': 'Y', '场': 'C', '文': 'W',
      '化': 'H', '中': 'Z', '心': 'X', '公': 'G', '园': 'Y', '森': 'S', '林': 'L',
      '山': 'S', '顶': 'D', '海': 'H', '边': 'B', '湖': 'H', '泊': 'B', '河': 'H',
      '谷': 'G', '峡': 'X', '瀑': 'P', '布': 'B', '洞': 'D', '穴': 'X', '岛': 'D',
      '古': 'G', '城': 'C', '镇': 'Z', '乡': 'X', '村': 'C', '街': 'J', '道': 'D',
      '路': 'L', '桥': 'Q', '门': 'M', '楼': 'L', '塔': 'T', '寺': 'S', '庙': 'M',
      '观': 'G', '阁': 'G', '台': 'T', '殿': 'D', '堂': 'T', '苑': 'Y', '轩': 'X',
      '居': 'J', '庐': 'L', '舍': 'S', '斋': 'Z', '馆': 'G', '榭': 'X', '亭': 'T',
      '廊': 'L', '轩': 'X', '室': 'S', '房': 'F', '厅': 'T', '堂': 'T', '楼': 'L',
      '阁': 'G', '殿': 'D', '宫': 'G', '府': 'F', '邸': 'D', '第': 'D', '庄': 'Z',
      '园': 'Y', '林': 'L', '圃': 'P', '圃': 'P', '苑': 'Y', '囿': 'Y', '苑': 'Y',
      '城': 'C', '堡': 'B', '寨': 'Z', '关': 'G', '卡': 'K', '站': 'Z', '场': 'C',
      '港': 'G', '湾': 'W', '澳': 'A', '村': 'C', '庄': 'Z', '镇': 'Z', '县': 'X',
      '市': 'S', '区': 'Q', '州': 'Z', '府': 'F', '省': 'S', '京': 'J', '都': 'D',
      '会': 'H', '堂': 'T', '中': 'Z', '心': 'X', '广': 'G', '场': 'C', '馆': 'G',
      '博': 'B', '物': 'W', '院': 'Y', '展': 'Z', '览': 'L', '中': 'Z', '心': 'X',
      '科': 'K', '技': 'J', '园': 'Y', '工': 'G', '业': 'Y', '园': 'Y', '创': 'C',
      '业': 'Y', '园': 'Y', '文': 'W', '化': 'H', '园': 'Y', '艺': 'Y', '术': 'S',
      '中': 'Z', '心': 'X', '运': 'Y', '动': 'D', '场': 'C', '体': 'T', '育': 'Y',
      '中': 'Z', '心': 'X', '游': 'Y', '乐': 'L', '场': 'C', '公': 'G', '园': 'Y',
      '植': 'Z', '物': 'W', '园': 'Y', '动': 'D', '物': 'W', '园': 'Y', '野': 'Y',
      '生': 'S', '园': 'Y', '水': 'S', '族': 'Z', '馆': 'G', '海': 'H', '洋': 'Y',
      '馆': 'G', '天': 'T', '文': 'W', '馆': 'G', '历': 'L', '史': 'S', '博': 'B',
      '物': 'W', '馆': 'G', '自': 'Z', '然': 'R', '博': 'B', '物': 'W', '馆': 'G'
    };

    if (!chineseStr) return 'AAA';
    
    let result = '';
    let charCount = 0;
    
    for (let i = 0; i < chineseStr.length && charCount < 3; i++) {
      const char = chineseStr[i];
      const firstLetter = pinyinMap[char];
      
      if (firstLetter) {
        result += firstLetter;
        charCount++;
      } else if (/[a-zA-Z]/.test(char)) {
        // 如果是英文字母，直接使用
        result += char.toUpperCase();
        charCount++;
      }
    }
    
    // 如果没有找到足够的字符，用A补齐到3位
    while (result.length < 3) {
      result += 'A';
    }
    
    return result;
  };

  // [新增] 数据清理函数：为现有数据重新生成唯一ID
  const fixDuplicateIds = (data) => {
    const fixDataArray = (items, idKey, prefix, type) => {
      const fixedItems = [];
      const allExistingIds = [];
      
      logger.info('ID_FIX', `开始修复${type}数据`, {
        itemCount: items.length,
        prefix,
        idKey
      });
      
      // 按世界观分组处理
      const groupedByWorldview = {};
      items.forEach(item => {
        const worldview = item.worldview || '默认世界观';
        if (!groupedByWorldview[worldview]) {
          groupedByWorldview[worldview] = [];
        }
        groupedByWorldview[worldview].push(item);
      });

      logger.debug('ID_FIX', '数据按世界观分组', {
        worldviews: Object.keys(groupedByWorldview),
        groups: Object.keys(groupedByWorldview).reduce((acc, worldview) => {
          acc[worldview] = groupedByWorldview[worldview].length;
          return acc;
        }, {})
      });

      Object.keys(groupedByWorldview).forEach(worldview => {
        const worldviewItems = groupedByWorldview[worldview];
        const worldviewPrefix = chineseToFirstLetters(worldview).substring(0, 3);
        
        logger.debug('ID_FIX', `处理${worldview}世界观的${type}数据`, {
          worldview,
          worldviewPrefix,
          itemsCount: worldviewItems.length
        });
        
        worldviewItems.forEach((item, index) => {
          const namePrefix = item.name || item.layer_name || item.title || '';
          const namePart = chineseToFirstLetters(namePrefix).substring(0, 2).toUpperCase();
          const fullPrefix = `${prefix}${worldviewPrefix}${namePart}`;
          
          // 收集当前世界观已有的ID
          const existingForWorldview = fixedItems
            .filter(fixed => fixed.worldview === worldview)
            .map(fixed => fixed[idKey]);
          
          // 收集所有已有ID确保全局唯一
          const allExisting = [...allExistingIds, ...existingForWorldview];
          
          const newId = generateSequentialId(prefix, allExisting, namePart, type, worldview);
          
          const oldId = item[idKey];
          const fixedItem = {
            ...item,
            [idKey]: newId
          };
          
          fixedItems.push(fixedItem);
          allExistingIds.push(newId);
          
          logger.debug('ID_FIX', `修复${type}项ID`, {
            worldview,
            oldId,
            newId,
            itemName: item.name || item.layer_name || item.title || '未知',
            namePrefix,
            namePart,
            fullPrefix
          });
        });
      });
      
      // 验证修复结果
      const finalIds = fixedItems.map(item => item[idKey]);
      const uniqueIds = new Set(finalIds);
      const hasDuplicates = finalIds.length !== uniqueIds.size;
      
      logger.info('ID_FIX', `${type}数据修复完成`, {
        originalCount: items.length,
        fixedCount: fixedItems.length,
        uniqueIds: uniqueIds.size,
        hasDuplicates,
        worldviewDistribution: fixedItems.reduce((acc, item) => {
          acc[item.worldview || '默认世界观'] = (acc[item.worldview || '默认世界观'] || 0) + 1;
          return acc;
        }, {})
      });
      
      if (hasDuplicates) {
        logger.error('ID_FIX', `${type}数据修复后仍有重复ID`, {
          duplicateIds: finalIds.filter((id, index) => finalIds.indexOf(id) !== index)
        });
      }
      
      return fixedItems;
    };

    return {
      scenes: fixDataArray(data.scenes || [], 'id', 'S', 'scene'),
      layers: fixDataArray(data.layers || [], 'layer_id', 'L', 'layer'), 
      plays: fixDataArray(data.plays || [], 'id', 'P', 'play'),
      commands: fixDataArray(data.commands || [], 'id', 'C', 'command')
    };
  };

  // [关键修复] 全局唯一ID生成器 - 彻底解决重复问题
  const generateSequentialId = (prefix, existingIds, groupPrefix = '', type = 'default', worldviewName = '') => {
    // 清理和验证existingIds
    const validIds = (existingIds || []).filter(id => id && typeof id === 'string');
    
    // [终极修复] 使用时间戳+随机数确保绝对唯一
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).slice(2, 5);
    
    // 生成世界观分组前缀（仅用于显示，不影响唯一性）
    const worldviewPrefix = worldviewName ? chineseToFirstLetters(worldviewName).substring(0, 3) : '';
    const namePrefix = (groupPrefix || worldviewPrefix || 'AAA').substring(0, 2).toUpperCase();
    
    if (type === 'layer') {
      // 层级：L+世界观前缀(3位)+名称前缀(2位)+时间戳(6位)+随机(3位)
      const newId = `${prefix}${worldviewPrefix}${namePrefix}${timestamp}${random}`;
      
      logger.debug('ID_GENERATION', '生成Layer ID', {
        prefix,
        worldviewName,
        worldviewPrefix,
        namePrefix,
        timestamp,
        random,
        newId,
        existingIds: validIds.slice(0, 5) // 只显示前5个避免日志过长
      });
      
      return newId;
    } else {
      // 其他类型：S/P/C+世界观前缀(3位)+名称前缀(2位)+时间戳(6位)+随机(3位)
      const newId = `${prefix}${worldviewPrefix}${namePrefix}${timestamp}${random}`;
      
      logger.debug('ID_GENERATION', '生成ID', {
        type,
        prefix,
        worldviewName,
        worldviewPrefix,
        namePrefix,
        timestamp,
        random,
        newId,
        existingIds: validIds.slice(0, 5) // 只显示前5个避免日志过长
      });
      
      return newId;
    }
  };

  // [新增] 强力ID冲突检测和修复函数
  const ensureUniqueIds = (items, idKey, type) => {
    const seenIds = new Set();
    const duplicates = [];
    const unique = [];
    
    items.forEach((item, index) => {
      const id = item[idKey];
      if (seenIds.has(id)) {
        duplicates.push({ item, index, id });
      } else {
        seenIds.add(id);
        unique.push(item);
      }
    });
    
    if (duplicates.length > 0) {
      logger.warn('ID_CONFLICT', `发现${type}数据ID冲突`, {
        totalItems: items.length,
        uniqueItems: unique.length,
        duplicateCount: duplicates.length,
        duplicates: duplicates.map(d => ({ id: d.id, index: d.index }))
      });
      
      // 为重复项生成新的唯一ID
      const fixed = duplicates.map(({ item }) => {
        const worldview = item.worldview || '默认世界观';
        const namePrefix = item.name || item.layer_name || item.title || '';
        const newId = generateSequentialId(
          type === 'layer' ? 'L' : type === 'scene' ? 'S' : type === 'play' ? 'P' : 'C',
          unique.map(u => u[idKey]),
          chineseToFirstLetters(namePrefix).substring(0, 2),
          type,
          worldview
        );
        
        return { ...item, [idKey]: newId };
      });
      
      logger.info('ID_CONFLICT', `修复${type}数据ID冲突`, {
        fixedCount: fixed.length,
        newIds: fixed.map(f => ({ oldId: f[idKey], newId: f[idKey] }))
      });
      
      return [...unique, ...fixed];
    }
    
    return items;
  };

  // V1.3.16 新增: 编辑历史记录标题
  const handleEditHistoryTitle = (timestamp, newTitle) => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
        setEditingHistoryId(null);
        showToast("标题不能为空，已取消修改", "error");
        return;
    }
    
    setGeneratedHistory(prev => prev.map(h => {
      if (h.timestamp === timestamp) {
        return { ...h, sceneName: trimmedTitle }; // 使用 sceneName 作为可编辑的标题
      }
      return h;
    }));
    
    setEditingHistoryId(null);
    setTempHistoryTitle('');
    showToast("故事标题已更新");
  };

  // V1.3 修复: 删除逻辑统一到此
  const openDeleteConfirmation = (id, type, name) => {
    setConfirmingDelete({ id, type, name });
  };

  const executeDelete = () => {
    if (!confirmingDelete) return;
    const { id, type } = confirmingDelete;

    if (type === 'scene') setScenes(prev => prev.filter(i => i.id !== id));
    if (type === 'layer') setLayers(prev => prev.filter(i => i.layer_id !== id));
    if (type === 'play') setPlays(prev => prev.filter(i => i.id !== id));
    if (type === 'command') setCommands(prev => prev.filter(i => i.id !== id));
    // 修复：清空所有历史记录的处理逻辑
    if (type === 'history' && id === 'ALL_HISTORY') setGeneratedHistory([]);
    if (type === 'history' && id !== 'ALL_HISTORY') setGeneratedHistory(prev => prev.filter(h => h.timestamp !== id));
    if (type === 'ALL') {
      setScenes(INITIAL_SCENES);
      setLayers(INITIAL_LAYERS);
      setPlays(INITIAL_PLAYS);
      setCommands(INITIAL_COMMANDS);
      setGeneratedHistory([]);
      // 清理所有本地存储
      clearAllData();
    }

    setConfirmingDelete(null);
    
    // 删除后立即保存
    setTimeout(() => {
      saveAllData();
    }, 100);
    
    showToast(type === 'ALL' ? "所有数据已重置并清理" : (type === 'history' && id === 'ALL_HISTORY' ? "所有历史记录已清空" : "删除成功"));
  };

  // V1.3 新增: 历史记录删除函数
  const handleDeleteHistory = (timestamp, name) => {
    openDeleteConfirmation(timestamp, 'history', `${name} 历史记录`);
  };

  // V1.3.2 新增: 复制故事文本到剪贴板 (修复权限错误，添加多层降级方案)
  const copyStoryToClipboard = (story, timestamp) => {
    try {
      // 生成文本内容
      const text = story.map(item => {
        if(item.type==='header') return `=== 场景: ${item.text.replace('场景：', '')} ===\n描述: ${item.desc}`;
        if(item.type==='play') return `[${item.layerName}] 玩法: ${item.title}\n描述: ${item.content}\n结果: ${item.result}`;
        if(item.type==='command') return `[指令] ${item.title} (${item.scope}): ${item.content}`;
        return '';
      }).join('\n\n');

      // 尝试使用 Clipboard API (现代方法)
      const copyWithClipboardAPI = async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopiedId(timestamp);
          setTimeout(() => setCopiedId(null), 2000);
          showToast("故事文本已复制到剪贴板");
        } catch (clipboardError) {
          // 降级方案: 创建临时文本框让用户手动复制
          copyWithFallback(text, timestamp);
        }
      };

      // 降级方案: 手动创建文本框选中内容
      const copyWithFallback = (textToCopy, ts) => {
        // 创建临时文本框
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.top = '-1000px';
        textArea.style.left = '-1000px';
        document.body.appendChild(textArea);

        // 选中并复制
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, textToCopy.length); // 兼容移动设备

        try {
          // 尝试 execCommand (旧版API，部分浏览器仍支持)
          document.execCommand('copy');
          setCopiedId(ts);
          setTimeout(() => setCopiedId(null), 2000);
          showToast("故事文本已复制到剪贴板 (降级模式)");
        } catch (execError) {
          // 完全降级: 提示用户手动复制
          showToast("复制失败，请手动复制文本", "error");
          // 创建弹窗显示文本
          const modal = document.createElement('div');
          modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            padding: 20px;
            box-sizing: border-box;
          `;

          const content = document.createElement('div');
          content.style.cssText = `
            background: white;
            flex: 1;
            border-radius: 8px;
            padding: 20px;
            overflow: auto;
            margin: auto;
            max-width: 80%;
            max-height: 80%;
          `;

          const pre = document.createElement('pre');
          pre.style.cssText = `
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.5;
          `;
          pre.textContent = textToCopy;

          const closeBtn = document.createElement('button');
          closeBtn.textContent = '关闭';
          closeBtn.style.cssText = `
            margin-top: 16px;
            padding: 8px 16px;
            background: #6366f1;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          `;
          closeBtn.onclick = () => document.body.removeChild(modal);

          content.appendChild(pre);
          content.appendChild(closeBtn);
          modal.appendChild(content);
          modal.style.display = 'flex'; // 确保显示
          document.body.appendChild(modal);

          // 自动选中文本
          // 确保 pre 是可编辑的才能 select
          pre.setAttribute('contenteditable', 'true');
          pre.focus();
          document.getSelection().selectAllChildren(pre);
          pre.removeAttribute('contenteditable');
        } finally {
          document.body.removeChild(textArea);
        }
      };

      // 执行复制逻辑
      copyWithClipboardAPI();

    } catch (err) {
      console.error("复制失败:", err);
      showToast("复制失败，请手动复制文本", "error");
    }
  };

  // V1.3.2 新增: 生成故事预览文本
  const getStoryPreview = (story) => {
    const previewLines = [];
    story.forEach(item => {
      if (item.type === 'header') previewLines.push(`场景: ${item.text.replace('场景：', '')}`);
      if (item.type === 'play') previewLines.push(`→ ${item.title}`);
      if (item.type === 'command') previewLines.push(`⚡ ${item.title}`);
    });
    // 只显示前5行
    return previewLines.slice(0, 5).join(' | ') + (previewLines.length > 5 ? '...' : '');
  };

  // [新增] 获取所有可用的世界观列表
  const getAvailableWorldviews = () => {
    const worldviews = new Set();
    scenes.forEach(scene => {
      if (scene.worldview) worldviews.add(scene.worldview);
    });
    return Array.from(worldviews).sort();
  };

  // [新增] 根据世界观过滤数据 - 增强日志版本
  const filterByWorldview = (data, type) => {
    const startTime = performance.now();
    
    logger.info('WORLDVIEW_FILTER', '开始世界观筛选', {
      enableWorldviewFilter,
      selectedWorldview,
      type,
      dataLength: data?.length || 0
    });
    
    // 记录输入数据的世界观分布
    if (data && data.length > 0) {
      const worldviewCounts = {};
      data.forEach(item => {
        const worldview = item.worldview || '(空)';
        worldviewCounts[worldview] = (worldviewCounts[worldview] || 0) + 1;
      });
      logger.debug('WORLDVIEW_FILTER', '输入数据世界观分布', worldviewCounts);
    }
    
    if (!enableWorldviewFilter || !selectedWorldview) {
      logger.info('WORLDVIEW_FILTER', '世界观筛选未启用，返回所有数据', {
        reason: !enableWorldviewFilter ? '筛选开关未启用' : '未选择世界观'
      });
      logPerformance('filterByWorldview-disabled', startTime);
      return data;
    }
    
    const filtered = data.filter((item, index) => {
      const itemWorldview = item.worldview || '';
      const matches = itemWorldview === selectedWorldview;
      const itemIdentifier = item.name || item.layer_name || item.title || item.id || `item-${index}`;
      
      // 详细记录每个项目的筛选结果
      logger.debug('WORLDVIEW_FILTER', '筛选项目', {
        index,
        identifier: itemIdentifier,
        itemWorldview,
        selectedWorldview,
        matches,
        itemData: {
          id: item.id,
          name: item.name,
          layer_name: item.layer_name,
          title: item.title
        }
      });
      
      return matches;
    });
    
    const endTime = performance.now();
    
    logger.info('WORLDVIEW_FILTER', '世界观筛选完成', {
      type,
      selectedWorldview,
      originalCount: data?.length || 0,
      filteredCount: filtered.length,
      removedCount: (data?.length || 0) - filtered.length,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    });
    
    // 记录筛选结果的世界观分布
    if (filtered.length > 0) {
      const filteredWorldviewCounts = {};
      filtered.forEach(item => {
        const worldview = item.worldview || '(空)';
        filteredWorldviewCounts[worldview] = (filteredWorldviewCounts[worldview] || 0) + 1;
      });
      logger.debug('WORLDVIEW_FILTER', '筛选后数据世界观分布', filteredWorldviewCounts);
    }
    
    logPerformance('filterByWorldview', startTime, endTime);
    return filtered;
  };

  // V1.3.8 修改: 导出数据链接 (Data URI)
  const handleExportDataLink = () => {
    try {
        const fullData = { 
            scenes, 
            layers, 
            plays, 
            commands 
        };
        const dataJson = JSON.stringify(fullData);
        
        // 使用简单的 base64 编码以避免 URL 字符问题
        const base64Data = btoa(unescape(encodeURIComponent(dataJson)));
        
        // 构造 Data URI (公开可用的链接格式)
        const dataUri = `data:application/json;base64,${base64Data}`;

        // 尝试使用 Clipboard API 自动复制到剪贴板
        navigator.clipboard.writeText(dataUri)
            .then(() => {
                showToast("数据共享链接已复制到剪贴板");
            })
            .catch(() => {
                // 降级方案: 创建临时文本框让用户手动复制
                const textArea = document.createElement('textarea');
                textArea.value = dataUri;
                textArea.style.position = 'fixed';
                textArea.style.top = '-1000px';
                textArea.style.left = '-1000px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                textArea.setSelectionRange(0, dataUri.length);

                try {
                    document.execCommand('copy');
                    showToast("数据共享链接已复制到剪贴板 (降级模式)");
                } catch (execError) {
                    showToast("复制失败，请手动复制文本框中的链接", "error");
                } finally {
                    document.body.removeChild(textArea);
                }
            });
    } catch (err) {
        console.error("生成数据链接失败:", err);
        showToast("生成数据共享链接失败", "error");
    }
  };


  const openEdit = (item, type) => {
    setEditingItem(item);
    setTargetType(type);
    setModalMode("edit");
    setCommandScopeType(item.scope_type || 'GLOBAL');
    
    // V1.3.7 关键初始化: 初始化多选目标 ID 状态
    if (type === 'command') {
      const targetIds = item.fk_target_id ? item.fk_target_id.split(',').map(id => id.trim()).filter(Boolean) : [];
      setCommandTargetIds(targetIds);
    } else {
      setCommandTargetIds([]);
    }

    // V1.3.12 确保批量导入的数组状态在打开其他模式时被重置或不干扰
    setBatchCommandTargetIdsArray([]); 

    setModalOpen(true);
  };

  const openAdd = (type) => {
    setEditingItem(null);
    setTargetType(type);
    setModalMode("add");
    setCommandScopeType('GLOBAL');
    setCommandTargetIds([]); // Reset for add
    setBatchCommandTargetIdsArray([]); // V1.3.12 Reset
    setModalOpen(true);
  };

  const openBatch = (type) => {
    setBatchText("");
    setTargetType(type);
    setModalMode("batch");
    // [新增] 重置批量导入世界观状态
    setBatchWorldview("");
    // [新增] 批量导入玩法时，默认选中第一个层级
    if (type === 'play' && layers.length > 0) {
        setBatchLayerId(layers[0].layer_id);
    }
    // [V1.3.9 新增] 批量导入指令时，重置作用域和目标ID
    if (type === 'command') {
        setBatchCommandScope('GLOBAL');
        setBatchCommandTargetIdsArray([]); // V1.3.12 New Reset
    }
    setModalOpen(true);
  };

  const openHistory = () => {
    setTargetType("history");
    setModalMode("history");
    // V1.3.16 新增: 打开历史记录时重置编辑状态
    setEditingHistoryId(null);
    setTempHistoryTitle('');
    setModalOpen(true);
  };

  // ------------------------------------------------------------------
  // [V1.3.10 关键修复] 导出生成故事为 TXT (修改为使用 Data URI 链接，以兼容 Android)
  const exportStoryToTxt = (story, storyTitle) => {
    const text = story.map(item => {
      if(item.type==='header') return `=== 场景: ${item.text.replace('场景：', '')} ===\n描述: ${item.desc}`;
      if(item.type==='play') return `[${item.layerName}] 玩法: ${item.title}\n描述: ${item.content}\n结果: ${item.result}`;
      if(item.type==='command') return `[指令] ${item.title} (${item.scope}): ${item.content}`;
      return '';
    }).join('\n\n');

    // 1. 对文本内容进行 URL 编码
    // 使用 encodeURIComponent 确保文本中的特殊字符（如换行、中文、标点）能安全地放入 URL 中
    const encodedText = encodeURIComponent(text); 
    
    // 2. 构造 Data URI
    // 格式: data:[<MIME-type>][;charset=<encoding>][;base64],<data>
    const dataUri = `data:text/plain;charset=utf-8,${encodedText}`;
    
    // 3. 创建下载链接并点击
    const a = document.createElement('a');
    a.href = dataUri; // <--- 使用 Data URI
    
    // 优化：支持中文文件名
    const fileName = `${storyTitle}_story_${new Date().toLocaleString().replace(/[/: ]/g, '-')}.txt`;
    a.download = fileName; // download 属性告诉浏览器使用此文件名
    
    // 4. 触发下载
    a.click();
    showToast("故事流程已导出为 TXT 文件");
  };
  // ------------------------------------------------------------------

  // ------------------------------------------------------------------
  // [V1.3.13 新增] 批量导出所有历史记录为 TXT
  const exportAllHistoryToTxt = () => {
    if (generatedHistory.length === 0) {
        showToast("没有历史记录可导出", "error");
        return;
    }

    let allText = "=== 剧情织造机 - 历史记录批量导出 ===\n";
    allText += `导出时间: ${new Date().toLocaleString()}\n\n`;

    generatedHistory.forEach((historyItem, index) => {
        // 1. 故事标题和元数据
        // V1.3.16 使用 sceneName 作为可编辑的标题
        allText += `\n==================== 故事 ${index + 1}: ${historyItem.sceneName} ====================\n`; 
        allText += `生成时间: ${new Date(historyItem.timestamp).toLocaleString()}\n\n`;

        // 2. 故事内容生成 (重用 exportStoryToTxt 的内部逻辑)
        const storyText = historyItem.story.map(item => {
            if (item.type === 'header') return `=== 场景: ${item.text.replace('场景：', '')} ===\n描述: ${item.desc}`;
            if (item.type === 'play') return `[${item.layerName}] 玩法: ${item.title}\n描述: ${item.content}\n结果: ${item.result}`;
            if (item.type === 'command') return `[指令] ${item.title} (${item.scope}): ${item.content}`;
            return '';
        }).join('\n\n');

        allText += storyText;
        allText += "\n";
    });

    // 3. 使用 Data URI 方式导出 (兼容 Android)
    const encodedText = encodeURIComponent(allText);
    const dataUri = `data:text/plain;charset=utf-8,${encodedText}`;

    const a = document.createElement('a');
    a.href = dataUri;
    const fileName = `all_story_history_${new Date().toLocaleString().replace(/[/: ]/g, '-')}.txt`;
    a.download = fileName;

    a.click();
    showToast(`成功批量导出 ${generatedHistory.length} 条历史记录为 TXT 文件`);
  };
  // ------------------------------------------------------------------


  // --- 智能解析与数据保存 ---
  const handleSave = (e) => {
    e.preventDefault();

    if (modalMode === 'batch') {
      handleBatchImport(targetType);
      return;
    }

    // 使用 FormData 获取非多选字段的值
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // 数据清洗与格式化
    const parseTags = (tagString) => (tagString || "").split(/[,，]/).map(t => t.trim()).filter(Boolean);
    if (data.tags) data.tags = parseTags(data.tags);
    if (data.probability) data.probability = parseInt(data.probability);
    if (data.sequence) data.sequence = parseInt(data.sequence);

    // 根据类型保存
    if (targetType === 'scene') {
      // [修复] 新增场景时生成基于名称首字母的唯一ID
      let newId = editingItem ? editingItem.id : generateSequentialId('S', scenes.map(s => s.id), 'AAA', 'scene');
      if (!editingItem && data.name) {
        const namePrefix = chineseToFirstLetters(data.name);
        newId = generateSequentialId('S', scenes.map(s => s.id), namePrefix, 'scene');
      }
      
      const newItem = {
        id: newId,
        name: data.name,
        description: data.description,
        tags: data.tags || [],
        worldview: data.worldview || "" // [新增] 添加世界观字段
      };
      setScenes(prev => editingItem ? prev.map(i => i.id === newItem.id ? newItem : i) : [...prev, newItem]);
    } else if (targetType === 'layer') {
      // [修复] 新增层级时生成基于名称首字母的唯一ID
      let newLayerId = editingItem ? editingItem.layer_id : generateSequentialId('L', layers.map(l => l.layer_id), 'SET', 'layer');
      if (!editingItem && data.layer_name) {
        const namePrefix = chineseToFirstLetters(data.layer_name);
        newLayerId = generateSequentialId('L', layers.map(l => l.layer_id), namePrefix, 'layer');
      }
      
      const newItem = {
        layer_id: newLayerId,
        layer_name: data.layer_name,
        sequence: data.sequence || (layers.length + 1),
        worldview: data.worldview || "" // [新增] 添加世界观字段
      };
      setLayers(prev => {
        const list = editingItem ? prev.map(i => i.layer_id === newItem.layer_id ? newItem : i) : [...prev, newItem];
        return list.sort((a, b) => a.sequence - b.sequence);
      });
    } else if (targetType === 'play') {
      // [修复] 新增玩法时生成基于关联层级或名称首字母的唯一ID
      let newPlayId = editingItem ? editingItem.id : generateSequentialId('P', plays.map(p => p.id), 'AAA', 'play');
      if (!editingItem) {
        // 尝试从关联的层级获取前缀
        if (data.fk_layer_id) {
          const targetLayer = layers.find(l => l.layer_id === data.fk_layer_id);
          if (targetLayer && targetLayer.layer_name) {
            const layerPrefix = chineseToFirstLetters(targetLayer.layer_name);
            newPlayId = generateSequentialId('P', plays.map(p => p.id), layerPrefix, 'play');
          }
        }
        // 如果没有找到层级，使用玩法名称的首字母
        else if (data.name) {
          const namePrefix = chineseToFirstLetters(data.name);
          newPlayId = generateSequentialId('P', plays.map(p => p.id), namePrefix, 'play');
        }
      }
      
      const newItem = {
        id: newPlayId,
        name: data.name,
        description: data.description,
        trigger_condition: data.trigger_condition,
        result: data.result,
        fk_layer_id: data.fk_layer_id,
        tags: data.tags || [],
        worldview: data.worldview || "" // [新增] 添加世界观字段
      };
      setPlays(prev => editingItem ? prev.map(i => i.id === newItem.id ? newItem : i) : [...prev, newItem]);
    } else if (targetType === 'command') {
      
      // V1.3.7 关键修复：从状态中获取多选字段的值
      let fk_target_id_value = "";
      
      if (data.scope_type === 'SCENE' || data.scope_type === 'LAYER') {
          // V1.3.7 修复：从状态 commandTargetIds 获取已选中的 ID 数组，并转换为逗号分隔的字符串
          fk_target_id_value = commandTargetIds.join(',');
          
          if (!fk_target_id_value) {
               showToast(`请为 ${data.scope_type} 作用域选择至少一个目标`, "error");
               return; // 阻止保存
          }
      } else {
          // GLOBAL 作用域无需 target ID
          fk_target_id_value = "";
      }

      // [修复] 新增指令时生成基于名称首字母的唯一ID
      let newCommandId = editingItem ? editingItem.id : generateSequentialId('C', commands.map(c => c.id), 'AAA', 'command');
      if (!editingItem && data.name) {
        const namePrefix = chineseToFirstLetters(data.name);
        newCommandId = generateSequentialId('C', commands.map(c => c.id), namePrefix, 'command');
      }

      const newItem = {
        id: newCommandId,
        name: data.name,
        description: data.description,
        probability: data.probability,
        scope_type: data.scope_type,
        fk_target_id: fk_target_id_value, // 使用状态中的值
        worldview: data.worldview || "" // [新增] 添加世界观字段
      };
      setCommands(prev => editingItem ? prev.map(i => i.id === newItem.id ? newItem : i) : [...prev, newItem]);
    }

    setModalOpen(false);
    showToast(editingItem ? "更新成功" : "创建成功");
  };

  // --- 智能批量解析逻辑 (增强场景标签识别 + 修复ID重复问题 + 世界观支持) ---
  const handleBatchImport = (type) => {
    if (!batchText.trim()) {
      showToast("请输入批量导入的内容", "error");
      return;
    }

    const lines = batchText.split('\n').filter(line => line.trim() !== "");
    let count = 0;
    const parseTags = (tagString) => (tagString || "").split(/[,，]/).map(t => t.trim()).filter(Boolean);
    
    // [V1.3.12 新增] 提取默认目标ID字符串
    let defaultTargetIdString = "";
    if (type === 'command' && (batchCommandScope === 'SCENE' || batchCommandScope === 'LAYER')) {
        defaultTargetIdString = batchCommandTargetIdsArray.join(',');
    }

    // [修复] 统一的世界观提取逻辑
    let worldviewName = "";
    let defaultSceneForWorldview = null;
    
    // 优先级1: 如果批量导入时指定了世界观，优先使用
    if (batchWorldview && batchWorldview.trim()) {
      worldviewName = batchWorldview.trim();
    }
    // 优先级2: 如果启用了世界观筛选，使用当前选中的世界观
    else if (enableWorldviewFilter && selectedWorldview) {
      worldviewName = selectedWorldview;
    } else {
      // 优先级3: 尝试找到第一个场景作为默认世界观
      if (scenes.length > 0) {
        defaultSceneForWorldview = scenes[0];
        worldviewName = defaultSceneForWorldview.worldview || defaultSceneForWorldview.name || "默认世界观";
      }
      
      // 根据导入类型进一步优化世界观选择
      if (type === 'scene' && lines.length > 0) {
        // 场景导入：使用第一个场景名称作为世界观
        const firstLine = lines[0].trim().replace(/^[\d\-\.\、\)\(]+\s*/, '');
        const name = firstLine.split(/[|｜:：]/)[0]?.trim();
        worldviewName = name || worldviewName || "未命名世界观";
      }
      else if (type === 'play') {
        // 玩法导入：从目标层级获取世界观
        if (batchLayerId) {
          const targetLayer = layers.find(l => l.layer_id === batchLayerId);
          if (targetLayer && targetLayer.worldview) {
            worldviewName = targetLayer.worldview;
          }
        }
        // 如果没有指定层级，使用第一个有世界观的层级，否则使用默认场景的世界观
        if (!worldviewName) {
          const layerWithWorldview = layers.find(l => l.worldview);
          if (layerWithWorldview) {
            worldviewName = layerWithWorldview.worldview;
          }
        }
      }
      else if (type === 'command') {
        // 指令导入：根据作用域获取世界观
        if (batchCommandScope === 'SCENE' && scenes.length > 0) {
          const sceneWithWorldview = scenes.find(s => s.worldview);
          if (sceneWithWorldview) {
            worldviewName = sceneWithWorldview.worldview;
          }
        } else if (batchCommandScope === 'LAYER' && layers.length > 0) {
          const layerWithWorldview = layers.find(l => l.worldview);
          if (layerWithWorldview) {
            worldviewName = layerWithWorldview.worldview;
          }
        }
        // 全局指令：使用第一个有世界观的层级，否则使用默认场景的世界观
        if (!worldviewName && layers.length > 0) {
          const layerWithWorldview = layers.find(l => l.worldview);
          if (layerWithWorldview) {
            worldviewName = layerWithWorldview.worldview;
          }
        }
      }
      else if (type === 'layer' && lines.length > 0) {
        // 层级导入：使用第一个层级名称作为世界观，否则使用默认场景的世界观
        const firstLine = lines[0].trim().replace(/^[\d\-\.\、\)\(]+\s*/, '');
        const name = firstLine.split(/[|｜:：]/)[0]?.trim();
        worldviewName = name || worldviewName || "未命名世界观";
      }
    }
    
    // 兜底：如果仍然没有世界观，使用默认值
    if (!worldviewName) {
      worldviewName = "默认世界观";
    }

    try {
      // [修复] 实现真正的按组递增ID生成
      let currentIds = [];
      if (type === 'scene') currentIds = scenes.map(s => s.id);
      else if (type === 'play') currentIds = plays.map(p => p.id);
      else if (type === 'command') currentIds = commands.map(c => c.id);
      else if (type === 'layer') currentIds = layers.map(l => l.layer_id);

      // [修复] 获取当前数据集的首字母作为ID前缀
      let groupPrefix = '';
      if (defaultSceneForWorldview && defaultSceneForWorldview.name) {
        groupPrefix = chineseToFirstLetters(defaultSceneForWorldview.name);
      } else if (lines.length > 0) {
        // 如果没有默认场景，使用第一行的首字母
        const firstLine = lines[0].trim().replace(/^[\d\-\.\、\)\(]+\s*/, '');
        const name = firstLine.split(/[|｜:：]/)[0]?.trim();
        if (name) {
          groupPrefix = chineseToFirstLetters(name);
        }
      }

      const newItems = lines.map((line, index) => {
        // 为每个项目生成唯一且递增的ID
        const idType = type === 'scene' ? 'scene' : 
                       type === 'play' ? 'play' : 
                       type === 'command' ? 'command' : 'layer';
        
        const prefix = type === 'scene' ? 'S' : 
                      type === 'play' ? 'P' : 
                      type === 'command' ? 'C' : 'L';
        
        // [修复] 使用统一的前缀逻辑
        let newId = generateSequentialId(prefix, currentIds, groupPrefix, idType);
        
        // 将新生成的ID添加到现有ID列表中，确保下一个ID继续递增
        currentIds.push(newId);
        let content = line.trim().replace(/^[\d\-\.\、\)\(]+\s*/, '');
        let parts;
        if (content.includes('|') || content.includes('｜')) {
          parts = content.split(/[|｜]/).map(p => p.trim());
        } else if (content.includes(':') || content.includes('：')) {
          parts = content.split(/[:：]/).map(p => p.trim());
        } else {
          parts = [content];
        }

        if (type === 'scene') {
          // 格式期望: 名称 | 描述 | 标签1,标签2
          const name = parts[0];
          if (!name) return null;

          // V1.3 新增: 增强标签识别
          let tags = parseTags(parts[2]);
          if (tags.length === 0 && parts[1]) {
            const tagMatch = parts[1].match(/(\[([^\]]+)\]|\(([^\)]+)\))$/);
            if (tagMatch) {
                tags = parseTags(tagMatch[2] || tagMatch[3]);
                parts[1] = parts[1].replace(tagMatch[0], '').trim();
            }
          }

          return {
            id: newId, // 使用新生成的唯一ID
            name: name,
            description: parts[1] || `${name} (批量导入)`,
            tags: tags,
            worldview: worldviewName // [新增] 添加世界观字段
          };
        }
        else if (type === 'play') {
          // 格式期望: 名称 | 描述 | 结果 | 层级ID | 标签
          const name = parts[0];
          if (!name) return null;

          // [修复] 智能选择目标层级：优先使用文本指定的层级，其次是batchLayerId，最后是同世界观的第一个层级
          let layerId = parts[3] || batchLayerId;
          
          // 如果仍然没有层级ID，尝试找到同世界观的第一个层级
          if (!layerId) {
            const worldviewLayers = layers.filter(l => l.worldview === worldviewName);
            if (worldviewLayers.length > 0) {
              layerId = worldviewLayers[0].layer_id;
            } else if (layers.length > 0) {
              layerId = layers[0].layer_id;
            }
          }

          return {
            id: newId, // 使用新生成的唯一ID
            name: name,
            description: parts[1] || "暂无描述",
            result: parts[2] || "未知结果",
            fk_layer_id: layerId, // <-- 使用智能选择的层级ID
            trigger_condition: "自动",
            tags: parseTags(parts[4]),
            worldview: worldviewName // [修复] 使用确定的世界观
          };
        }
        else if (type === 'command') {
          // 格式期望: 名称 | 描述 | 概率 | 作用域 (GLOBAL/SCENE/LAYER) | 目标ID (S001,S002 或 L1_SETUP,L2_CORE)
          const name = parts[0];
          if (!name) return null;

          // [修复] 如果文本行中未指定作用域 (parts[3]为空)，则使用模态框中选择的 batchCommandScope
          let scope = parts[3] ? parts[3].toUpperCase() : batchCommandScope;
          if (!['GLOBAL', 'SCENE', 'LAYER'].includes(scope)) scope = 'GLOBAL';
          
          // 批量导入时目标 ID 直接使用输入的字符串
          let targetId = parts[4] || "";

          // [修复] 智能处理目标ID：如果作用域为 SCENE/LAYER 且文本行未指定目标ID，则智能选择同世界观的默认目标
          if ((scope === 'SCENE' || scope === 'LAYER') && !targetId) {
              if (defaultTargetIdString) {
                  targetId = defaultTargetIdString;
              } else {
                  // 智能选择同世界观的默认目标
                  if (scope === 'SCENE') {
                      const worldviewScenes = scenes.filter(s => s.worldview === worldviewName);
                      if (worldviewScenes.length > 0) {
                          targetId = worldviewScenes.map(s => s.id).join(',');
                      }
                  } else if (scope === 'LAYER') {
                      const worldviewLayers = layers.filter(l => l.worldview === worldviewName);
                      if (worldviewLayers.length > 0) {
                          targetId = worldviewLayers.map(l => l.layer_id).join(',');
                      }
                  }
              }
          }

          // [修复] 验证目标ID是否属于同一世界观，如果不属于则移除
          if (targetId && (scope === 'SCENE' || scope === 'LAYER')) {
              const targetIdArray = targetId.split(',').map(id => id.trim()).filter(Boolean);
              const validTargetIds = targetIdArray.filter(id => {
                  if (scope === 'SCENE') {
                      const scene = scenes.find(s => s.id === id);
                      return scene && scene.worldview === worldviewName;
                  } else if (scope === 'LAYER') {
                      const layer = layers.find(l => l.layer_id === id);
                      return layer && layer.worldview === worldviewName;
                  }
                  return false;
              });
              targetId = validTargetIds.join(',');
          }

          return {
            id: newId, // 使用新生成的唯一ID
            name: name,
            description: parts[1] || "系统指令",
            probability: parseInt(parts[2]) || 20,
            scope_type: scope, // 使用更新后的 scope
            fk_target_id: targetId, // 使用修复后的 targetId
            worldview: worldviewName // [修复] 使用确定的世界观
          };
        }
        else if (type === 'layer') {
          // 格式期望: 层级名称 | 执行顺序
          const layerName = parts[0];
          if (!layerName) return null;

          let sequence = parseInt(parts[1]) || (layers.length + 1);
          
          // 如果层级名称只包含数字，使用默认场景的首字母作为前缀
          let finalId = newId;
          if (/^\d+$/.test(layerName) && defaultSceneForWorldview && defaultSceneForWorldview.name) {
            const sceneFirstLetters = chineseToFirstLetters(defaultSceneForWorldview.name);
            const existingWithPrefix = currentIds.filter(id => id.startsWith(`L${sceneFirstLetters}`));
            const existingNumbers = existingWithPrefix
              .map(id => {
                const match = id.match(new RegExp(`^L${sceneFirstLetters}(\\d{2})$`));
                return match ? parseInt(match[1]) : 0;
              })
              .filter(num => num > 0);
            
            const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
            const nextNumber = maxNumber + 1;
            
            finalId = `L${sceneFirstLetters}${nextNumber.toString().padStart(2, '0')}`;
          }

          return {
            layer_id: finalId, // 使用生成的层级ID
            layer_name: layerName,
            sequence: sequence,
            worldview: worldviewName // [修复] 使用确定的世界观
          };
        }
        return null;
      }).filter(Boolean);

      if (newItems.length === 0) {
        showToast("未解析到有效数据，请检查格式", "error");
        return;
      }

      if (type === 'scene') setScenes(prev => [...prev, ...newItems]);
      else if (type === 'play') setPlays(prev => [...prev, ...newItems]);
      else if (type === 'command') setCommands(prev => [...prev, ...newItems]);
      else if (type === 'layer') setLayers(prev => {
        const list = [...prev, ...newItems];
        return list.sort((a, b) => a.sequence - b.sequence);
      });

      count = newItems.length;
      showToast(`智能识别并导入 ${count} 条数据（使用递增序号，世界观：${worldviewName}）`);
      setModalOpen(false);
      
      // [修复] 批量导入成功后重置相关状态，避免选择后刷新默认选中问题
      setBatchWorldview(""); // 重置批量世界观状态
      if (type === 'scene') {
        setSelectedSceneId("");
        setSelectedWorldview("");
        setEnableWorldviewFilter(false);
      } else if (type === 'play' || type === 'command') {
        // 如果导入了玩法或指令，也重置场景选择状态
        setSelectedSceneId("");
      }
    } catch (e) {
      console.error("批量导入解析错误:", e);
      showToast(`解析失败: ${e.message}`, "error");
    }
  };

  // --- 随机生成器逻辑 (世界观支持) ---
  const handleGenerateStory = () => {
    const startTime = performance.now();
    
    logger.info('STORY_GENERATION', '开始生成故事', {
      selectedSceneId,
      selectedWorldview,
      enableWorldviewFilter,
      scenesCount: scenes.length,
      layersCount: layers.length,
      playsCount: plays.length,
      commandsCount: commands.length
    });
    
    if (!selectedSceneId) {
      logger.warn('STORY_GENERATION', '未选择场景');
      showToast("请先选择一个起始场景！", "error");
      return;
    }

    // [关键修复] 应用世界观筛选到场景查找
    let filteredScenes = scenes;
    if (enableWorldviewFilter && selectedWorldview) {
      filteredScenes = scenes.filter(s => s.worldview === selectedWorldview);
      logger.info('STORY_GENERATION', '应用世界观筛选', {
        selectedWorldview,
        originalScenesCount: scenes.length,
        filteredScenesCount: filteredScenes.length,
        removedScenesCount: scenes.length - filteredScenes.length
      });
    }
    
    const scene = filteredScenes.find(s => s.id === selectedSceneId);
    if (!scene) {
      logger.error('STORY_GENERATION', '未找到目标场景', {
        selectedSceneId,
        availableSceneIds: filteredScenes.map(s => s.id),
        availableSceneNames: filteredScenes.map(s => s.name)
      });
      return;
    }

    // [新增] 世界观校验
    if (enableWorldviewFilter && selectedWorldview && scene.worldview !== selectedWorldview) {
      logger.error('STORY_GENERATION', '场景世界观不匹配', {
        sceneName: scene.name,
        sceneWorldview: scene.worldview,
        expectedWorldview: selectedWorldview
      });
      showToast(`选中的场景"${scene.name}"不属于当前选择的世界观"${selectedWorldview}"`, "error");
      return;
    }

    logger.info('STORY_GENERATION', '确认使用场景', {
      sceneId: scene.id,
      sceneName: scene.name,
      sceneWorldview: scene.worldview,
      sceneTags: scene.tags
    });

    let storyFlow = [];

    // 1. 添加场景头
    const headerItem = { 
      type: 'header', 
      text: `场景：${scene.name}`, 
      desc: scene.description 
    };
    storyFlow.push(headerItem);
    
    logger.info('STORY_GENERATION', '添加场景头', { headerItem });

    // 2. [新增] 根据世界观过滤数据
    logger.info('STORY_GENERATION', '开始世界观数据过滤');
    
    const filteredLayers = filterByWorldview(layers, 'layer');
    const filteredPlays = filterByWorldview(plays, 'play');
    const filteredCommands = filterByWorldview(commands, 'command');

    logger.info('STORY_GENERATION', '世界观数据过滤完成', {
      originalCounts: {
        layers: layers.length,
        plays: plays.length,
        commands: commands.length
      },
      filteredCounts: {
        layers: filteredLayers.length,
        plays: filteredPlays.length,
        commands: filteredCommands.length
      },
      selectedWorldview
    });

    // 3. 遍历层级
    const sortedLayers = [...filteredLayers].sort((a, b) => a.sequence - b.sequence);
    
    logger.info('STORY_GENERATION', '层级排序完成', {
      totalLayers: sortedLayers.length,
      layerSequence: sortedLayers.map(l => ({ 
        id: l.layer_id, 
        name: l.layer_name, 
        sequence: l.sequence,
        worldview: l.worldview 
      }))
    });
    
    // 3.5 用于追踪已使用的玩法和指令，确保每个只出现一次
    const usedPlayIds = new Set();
    const usedCommandIds = new Set();

    sortedLayers.forEach((layer, layerIndex) => {
      logger.debug('STORY_GENERATION', `处理层级 ${layerIndex + 1}/${sortedLayers.length}`, {
        layerId: layer.layer_id,
        layerName: layer.layer_name,
        sequence: layer.sequence
      });

      // A. 抽取玩法 (Play) - [修复] 每个玩法只出现一次
      const layerPlays = filteredPlays.filter(p => 
        p.fk_layer_id === layer.layer_id && 
        !usedPlayIds.has(p.id) // 确保玩法未被使用过
      );

      logger.debug('STORY_GENERATION', `层级${layer.layer_name}可用玩法`, {
        layerId: layer.layer_id,
        availablePlays: layerPlays.map(p => ({ 
          id: p.id, 
          name: p.name, 
          tags: p.tags,
          worldview: p.worldview 
        })),
        usedPlayIds: Array.from(usedPlayIds)
      });

      if (layerPlays.length > 0) {
        const scoredPlays = layerPlays.map(p => {
          const matchCount = p.tags.filter(t => scene.tags.includes(t)).length;
          return { ...p, score: matchCount };
        });

        const maxScore = Math.max(...scoredPlays.map(p => p.score));
        const matchedPlays = maxScore > 0
          ? scoredPlays.filter(p => p.score === maxScore)
          : layerPlays;

        const selectedPlay = matchedPlays[Math.floor(Math.random() * matchedPlays.length)];

        // 标记此玩法为已使用
        usedPlayIds.add(selectedPlay.id);

        const playItem = {
          type: 'play',
          layerName: layer.layer_name,
          title: selectedPlay.name,
          content: selectedPlay.description,
          result: selectedPlay.result
        };
        storyFlow.push(playItem);
        
        logger.info('STORY_GENERATION', '选择玩法', {
          layerName: layer.layer_name,
          selectedPlay: {
            id: selectedPlay.id,
            name: selectedPlay.name,
            score: selectedPlay.score,
            matchCount: maxScore,
            worldview: selectedPlay.worldview
          },
          alternatives: matchedPlays.length > 1 ? matchedPlays.length - 1 : 0
        });
      } else {
        logger.debug('STORY_GENERATION', `层级${layer.layer_name}无可用玩法`, {
          layerId: layer.layer_id,
          allUsedPlayIds: Array.from(usedPlayIds)
        });
      }

      // B. 抽取指令 (Command) - [修复] 每个指令只出现一次
      const possibleCommands = filteredCommands.filter(c => {
        // 确保指令未被使用过
        if (usedCommandIds.has(c.id)) return false;
        
        if (c.scope_type === 'GLOBAL') return true;
        
        // V1.3.7 统一处理 SCENE 和 LAYER 的多目标 ID 检查
        const targetIds = c.fk_target_id ? c.fk_target_id.split(',').map(id => id.trim()).filter(Boolean) : [];

        if (c.scope_type === 'SCENE') {
            // 检查当前场景ID是否在目标ID列表中
            if (targetIds.includes(scene.id)) return true;
        }

        if (c.scope_type === 'LAYER') {
            // 检查当前层级ID是否在目标ID列表中 (支持多选)
            if (targetIds.includes(layer.layer_id)) return true;
        }
        return false;
      });

      possibleCommands.forEach(cmd => {
        const roll = Math.random() * 100;
        if (roll <= cmd.probability) {
          // 标记此指令为已使用
          usedCommandIds.add(cmd.id);
          
          storyFlow.push({
            type: 'command',
            title: cmd.name,
            content: cmd.description,
            scope: cmd.scope_type
          });
        }
      });
    });

    setGeneratedStory(storyFlow);

    // V1.3 新增: 存储到历史记录
    setGeneratedHistory(prev => [{
      timestamp: Date.now(),
      sceneName: scene.name, // 默认使用场景名称作为历史记录标题
      story: storyFlow,
    }, ...prev]);

    showToast("故事流程已生成并保存到历史记录");
  };

  // 新增：开启剧情走向模式 - 增强日志版本
  const startInteractiveMode = () => {
    const startTime = performance.now();
    
    logger.info('INTERACTIVE_MODE', '开始进入剧情走向模式', {
      selectedSceneId,
      selectedWorldview,
      enableWorldviewFilter,
      scenesCount: scenes.length
    });

    // 记录所有场景信息
    logger.debug('INTERACTIVE_MODE', '所有场景数据', scenes.map(s => ({
      id: s.id,
      name: s.name,
      worldview: s.worldview,
      description: s.description?.substring(0, 50) + '...'
    })));

    if (!selectedSceneId) {
      logger.warn('INTERACTIVE_MODE', '未选择起始场景', {
        availableScenes: scenes.length,
        sceneIds: scenes.map(s => s.id)
      });
      showToast("请先选择一个起始场景！", "error");
      logError(new Error('未选择起始场景'), null, { 
        action: 'startInteractiveMode',
        availableScenes: scenes.length 
      });
      return;
    }

    logger.debug('INTERACTIVE_MODE', '开始场景筛选', {
      enableWorldviewFilter,
      selectedWorldview,
      originalScenesCount: scenes.length
    });

    // [关键修复] 先应用ID唯一性修复，再筛选场景
    const uniqueScenes = ensureUniqueIds(scenes, 'id', 'scene');
    
    // [关键修复] 应用世界观筛选到场景查找
    let filteredScenes = uniqueScenes;
    if (enableWorldviewFilter && selectedWorldview) {
      filteredScenes = uniqueScenes.filter(s => s.worldview === selectedWorldview);
      console.log(`筛选后的场景:`, filteredScenes.map(s => ({ id: s.id, name: s.name, worldview: s.worldview })));
      
      logger.info('INTERACTIVE_MODE', '世界观筛选完成', {
        selectedWorldview,
        originalCount: uniqueScenes.length,
        filteredCount: filteredScenes.length,
        removedCount: uniqueScenes.length - filteredScenes.length,
        filteredScenes: filteredScenes.map(s => ({ id: s.id, name: s.name, worldview: s.worldview }))
      });
    }
    
    logger.debug('INTERACTIVE_MODE', '开始查找目标场景', {
      targetSceneId: selectedSceneId,
      searchInFilteredScenes: filteredScenes.length,
      availableSceneIds: filteredScenes.map(s => s.id)
    });

    // [修复] 精确匹配场景ID，避免重复ID导致的错误选择
    const scene = filteredScenes.find(s => s.id === selectedSceneId);
    
    // 如果没找到，尝试按名称匹配（作为后备方案）
    const fallbackScene = !scene && selectedSceneId ? 
      filteredScenes.find(s => s.name.includes(selectedSceneId) || selectedSceneId.includes(s.name)) : null;
    
    if (!scene) {
      logger.error('INTERACTIVE_MODE', '未找到目标场景', {
        selectedSceneId,
        searchedInFiltered: filteredScenes.length,
        availableSceneIds: filteredScenes.map(s => s.id),
        availableSceneNames: filteredScenes.map(s => s.name),
        worldviews: [...new Set(filteredScenes.map(s => s.worldview))]
      });
      
      console.error(`未找到场景 ID: ${selectedSceneId}`);
      showToast("选中的场景不存在或已被移除", "error");
      
      logError(new Error(`未找到场景 ID: ${selectedSceneId}`), null, {
        action: 'startInteractiveMode',
        selectedSceneId,
        filteredScenesCount: filteredScenes.length,
        availableScenes: filteredScenes.map(s => ({ id: s.id, name: s.name, worldview: s.worldview }))
      });
      return;
    }

    logger.info('INTERACTIVE_MODE', '找到目标场景', {
      sceneId: scene.id,
      sceneName: scene.name,
      sceneWorldview: scene.worldview,
      sceneDescription: scene.description?.substring(0, 100) + '...'
    });

    // [新增] 世界观校验
    if (enableWorldviewFilter && selectedWorldview && scene.worldview !== selectedWorldview) {
      logger.error('INTERACTIVE_MODE', '场景世界观不匹配', {
        sceneName: scene.name,
        sceneWorldview: scene.worldview,
        expectedWorldview: selectedWorldview
      });
      
      showToast(`选中的场景"${scene.name}"不属于当前选择的世界观"${selectedWorldview}"`, "error");
      return;
    }

    logger.info('INTERACTIVE_MODE', '设置交互模式状态', {
      sceneId: scene.id,
      sceneName: scene.name
    });

    // 记录状态变更
    const beforeState = {
      currentScene: null,
      interactiveMode: false,
      interactiveStory: []
    };

    setCurrentScene(scene);
    setCurrentLayerIndex(0);
    setInteractiveStory([{
      type: 'header',
      text: `场景：${scene.name}`,
      desc: scene.description
    }]);
    setSelectedChoices([]);
    setSelectedCommands([]);
    setCandidatePlays([]);
    setCandidateCommands([]);
    setIsFirstLoad(true);
    setInteractiveMode(true);

    const afterState = {
      currentScene: scene,
      interactiveMode: true,
      interactiveStory: [{
        type: 'header',
        text: `场景：${scene.name}`,
        desc: scene.description
      }]
    };

    logDataChange('INTERACTIVE_MODE', '进入剧情走向模式', beforeState, afterState, scene.id);
    
    logger.info('INTERACTIVE_MODE', '开始获取初始候选选项', {
      sceneId: scene.id,
      layerIndex: 0
    });
    
    // 初始化时获取第一层的候选选项
    const { plays, commands } = getCandidatesForCurrentLayer(scene, 0);
    
    logger.info('INTERACTIVE_MODE', '获取初始候选选项完成', {
      playsCount: plays.length,
      commandsCount: commands.length,
      plays: plays.map(p => ({ id: p.id, title: p.title, scope: p.scope })),
      commands: commands.map(c => ({ id: c.id, title: c.title, scope: c.scope }))
    });
    
    const endTime = performance.now();
    logPerformance('startInteractiveMode', startTime, endTime);

    logger.info('INTERACTIVE_MODE', '成功进入剧情走向模式', {
      sceneId: scene.id,
      sceneName: scene.name,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    });

    showToast("进入剧情走向模式");
    setCandidatePlays(plays);
    setCandidateCommands(commands);
  };

  // 新增：自动创建缺失的层级
  const createMissingLayers = () => {
    const filteredPlays = filterByWorldview(plays, 'play');
    const allLayerIdsFromPlays = [...new Set(filteredPlays.map(p => p.fk_layer_id))];
    const existingLayerIds = layers.map(l => l.layer_id);
    const missingLayerIds = allLayerIdsFromPlays.filter(id => !existingLayerIds.includes(id));
    
    if (missingLayerIds.length === 0) {
      showToast("没有缺失的层级", "success");
      return;
    }
    
    // 为每个缺失的层级创建新的层级条目
    const newLayers = missingLayerIds.map((layerId, index) => {
      // 尝试从玩法中推断世界观
      const relatedPlay = filteredPlays.find(p => p.fk_layer_id === layerId);
      const worldview = relatedPlay?.worldview || "";
      
      // 智能生成层级名称
      let layerName = `自动层级 ${layerId}`;
      if (layerId.includes('L1') || layerId.includes('1')) layerName = "第一幕";
      else if (layerId.includes('L2') || layerId.includes('2')) layerName = "第二幕";
      else if (layerId.includes('L3') || layerId.includes('3')) layerName = "第三幕";
      else if (layerId.includes('L4') || layerId.includes('4')) layerName = "第四幕";
      else if (layerId.includes('L5') || layerId.includes('5')) layerName = "第五幕";
      else if (layerId.includes('START') || layerId.includes('BEGIN')) layerName = "开始阶段";
      else if (layerId.includes('END') || layerId.includes('FINISH')) layerName = "结束阶段";
      else if (layerId.includes('CORE') || layerId.includes('MAIN')) layerName = "核心阶段";
      else if (layerId.includes('SETUP') || layerId.includes('PREP')) layerName = "准备阶段";
      
      return {
        layer_id: layerId,
        layer_name: layerName,
        sequence: layers.length + index + 1,
        worldview: worldview
      };
    });
    
    setLayers(prev => [...prev, ...newLayers]);
    showToast(`成功创建 ${newLayers.length} 个缺失层级`, "success");
  };
  const exitInteractiveMode = () => {
    if (typeof window !== 'undefined' && window.confirm && window.confirm("确定要退出剧情走向模式吗？当前进度将不会保存到历史记录。")) {
      setInteractiveMode(false);
      setCurrentLayerIndex(0);
      setInteractiveStory([]);
      setSelectedChoices([]);
      setSelectedCommands([]);
      setCandidatePlays([]);
      setCandidateCommands([]);
      setCurrentScene(null);
      setIsFirstLoad(true);
      // 保存退出状态
      safeLocalStorage.set(STORAGE_KEYS.interactiveMode, false);
      showToast("已退出剧情走向模式");
    }
  };

  // 新增：获取指定层级的候选选项
  const getCandidatesForCurrentLayer = (scene = currentScene, layerIndex = currentLayerIndex) => {
    // [关键修复] 应用世界观筛选到所有相关数据
    let filteredLayers = layers;
    let filteredPlays = plays;
    let filteredCommands = commands;
    
    if (enableWorldviewFilter && selectedWorldview) {
      filteredLayers = layers.filter(l => l.worldview === selectedWorldview);
      filteredPlays = plays.filter(p => p.worldview === selectedWorldview);
      filteredCommands = commands.filter(c => c.worldview === selectedWorldview);
    }
    
    if (!scene || !filteredLayers || filteredLayers.length === 0) return { plays: [], commands: [] };
    
    const sortedLayers = [...filteredLayers].sort((a, b) => a.sequence - b.sequence);
    
    // [关键修复] 防止索引越界，确保当前层级存在
    if (layerIndex >= sortedLayers.length) return { plays: [], commands: [] };
    
    const currentLayer = sortedLayers[layerIndex];
    
    // [额外验证] 确保当前层级的ID在筛选后的玩法中存在对应的玩法
    const layerExistsInFilteredPlays = filteredPlays.some(p => p.fk_layer_id === currentLayer.layer_id);
    if (!layerExistsInFilteredPlays) {
      console.warn(`当前层级 ${currentLayer.layer_name} (${currentLayer.layer_id}) 在当前世界观 "${selectedWorldview}" 中没有对应的玩法`);
    }
    
    // 获取玩法候选（基于标签匹配 + 使用筛选后的数据）
    let layerPlays = filteredPlays.filter(p => p.fk_layer_id === currentLayer.layer_id);
    
    // [修复] 过滤已经使用过的玩法，确保每个玩法在故事中只出现一次
    const usedPlayIds = interactiveStory
      .filter(item => item.type === 'play')
      .map(item => {
        // 在筛选后的玩法中查找
        const play = filteredPlays.find(p => p.name === item.title);
        return play ? play.id : null;
      })
      .filter(id => id !== null);
    
    layerPlays = layerPlays.filter(p => !usedPlayIds.includes(p.id));
    
    const scoredPlays = layerPlays.map(p => {
      const matchCount = p.tags.filter(t => scene.tags.includes(t)).length;
      return { ...p, score: matchCount };
    });
    
    // 选择最匹配的3-4个玩法
    const maxScore = Math.max(...scoredPlays.map(p => p.score));
    const matchedPlays = maxScore > 0
      ? scoredPlays.filter(p => p.score === maxScore)
      : layerPlays;
    
    const selectedPlays = matchedPlays
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(4, matchedPlays.length));

    // 获取指令候选（基于概率 + 使用筛选后的数据 + 重复检查）
    let possibleCommands = filteredCommands.filter(c => {
      if (c.scope_type === 'GLOBAL') return true;
      
      const targetIds = c.fk_target_id ? c.fk_target_id.split(',').map(id => id.trim()).filter(Boolean) : [];
      
      if (c.scope_type === 'SCENE') {
        return targetIds.includes(scene.id);
      }
      if (c.scope_type === 'LAYER') {
        return targetIds.includes(currentLayer.layer_id);
      }
      return false;
    });

    // [修复] 过滤已经使用过的指令，确保每个指令在故事中只出现一次
    const usedCommandIds = interactiveStory
      .filter(item => item.type === 'command')
      .map(item => {
        // [关键修复] 在筛选后的指令中查找，而不是原始commands数组
        const cmd = filteredCommands.find(c => c.name === item.title);
        return cmd ? cmd.id : null;
      })
      .filter(id => id !== null);

    possibleCommands = possibleCommands.filter(c => !usedCommandIds.includes(c.id));

    const triggeredCommands = possibleCommands.filter(cmd => {
      const roll = Math.random() * 100;
      return roll <= cmd.probability;
    });

    return {
      plays: selectedPlays,
      commands: triggeredCommands,
      // [调试信息] 返回当前层级的详细信息，便于调试
      currentLayer: currentLayer,
      worldviewFiltered: enableWorldviewFilter && selectedWorldview,
      // [新增] 返回筛选后的数据，确保后续处理使用正确的数据
      filteredData: {
        layers: filteredLayers,
        plays: filteredPlays,
        commands: filteredCommands
      }
    };
  };

  // 新增：处理用户选择
  const handleInteractiveChoice = () => {
    if (selectedChoices.length === 0 && selectedCommands.length === 0) {
      showToast("请至少选择一个选项", "error");
      return;
    }

    // [关键修复] 使用getCandidatesForCurrentLayer获取筛选后的数据，确保数据一致性
    const { filteredData } = getCandidatesForCurrentLayer(currentScene, currentLayerIndex);
    const filteredLayers = filteredData.layers;
    const filteredPlays = filteredData.plays;
    const filteredCommands = filteredData.commands;
    
    // [额外安全检查] 确保筛选后的数据不为空
    if (!filteredLayers || filteredLayers.length === 0) {
      showToast("当前筛选条件下没有可用层级", "error");
      return;
    }
    
    if (!filteredPlays || filteredPlays.length === 0) {
      showToast("当前筛选条件下没有可用玩法", "error");
      return;
    }
    
    if (!filteredCommands || filteredCommands.length === 0) {
      showToast("当前筛选条件下没有可用指令", "error");
      return;
    }
    
    const sortedLayers = [...filteredLayers].sort((a, b) => a.sequence - b.sequence);
    
    // [关键修复] 防止索引越界
    if (currentLayerIndex >= sortedLayers.length) {
      showToast(`当前层级索引 ${currentLayerIndex} 超出范围，总层数 ${sortedLayers.length}`, "error");
      return;
    }
    
    const currentLayer = sortedLayers[currentLayerIndex];
    
    // [安全检查] 确保当前层级存在且属于正确的世界观
    if (!currentLayer) {
      showToast("当前层级不存在或已被移除", "error");
      return;
    }
    
    // [调试信息] 添加日志帮助调试
    console.log(`处理选择 - 当前世界观: ${selectedWorldview}, 当前层级: ${currentLayer.layer_name} (${currentLayer.layer_id})`);
    console.log(`可用玩法数量: ${filteredPlays.length}, 可用指令数量: ${filteredCommands.length}`);
    
    // 添加选择结果到故事
    const newStoryItems = [];
    
    // 添加玩法结果 - [关键修复] 使用已筛选的数据，确保世界观匹配
    selectedChoices.forEach(playId => {
      // [重要] 使用筛选后的 filteredPlays，确保世界观一致
      const play = filteredPlays.find(p => p.id === playId);
      if (play) {
        // [额外验证] 确保玩法属于当前层级的正确世界观
        if (play.fk_layer_id === currentLayer.layer_id) {
          newStoryItems.push({
            type: 'play',
            layerName: currentLayer.layer_name,
            title: play.name,
            content: play.description,
            result: play.result
          });
          console.log(`添加玩法: ${play.name} (所属世界观: ${play.worldview})`);
        } else {
          console.warn(`玩法 ${play.name} (ID: ${play.id}) 不属于当前层级 ${currentLayer.layer_name} (${currentLayer.layer_id})，当前玩法所属层级: ${play.fk_layer_id}，已跳过`);
        }
      } else {
        console.warn(`未找到玩法 ID: ${playId} 在当前世界观 "${selectedWorldview}" 的筛选数据中`);
      }
    });

    // 添加指令结果 - [关键修复] 使用已筛选的数据，确保世界观匹配
    selectedCommands.forEach(cmdId => {
      // [重要] 使用筛选后的 filteredCommands，确保世界观一致
      const cmd = filteredCommands.find(c => c.id === cmdId);
      if (cmd) {
        // [额外验证] 验证指令的作用域是否包含当前场景或层级
        let isValidScope = false;
        if (cmd.scope_type === 'GLOBAL') {
          isValidScope = true;
        } else if (cmd.scope_type === 'SCENE' && currentScene) {
          const targetIds = cmd.fk_target_id ? cmd.fk_target_id.split(',').map(id => id.trim()).filter(Boolean) : [];
          isValidScope = targetIds.includes(currentScene.id);
        } else if (cmd.scope_type === 'LAYER') {
          const targetIds = cmd.fk_target_id ? cmd.fk_target_id.split(',').map(id => id.trim()).filter(Boolean) : [];
          isValidScope = targetIds.includes(currentLayer.layer_id);
        }
        
        if (isValidScope) {
          newStoryItems.push({
            type: 'command',
            title: cmd.name,
            content: cmd.description,
            scope: cmd.scope_type
          });
          console.log(`添加指令: ${cmd.name} (所属世界观: ${cmd.worldview})`);
        } else {
          console.warn(`指令 ${cmd.name} (ID: ${cmd.id}) 不属于当前作用域，已跳过。作用域: ${cmd.scope_type}, 目标: ${cmd.fk_target_id}`);
        }
      } else {
        console.warn(`未找到指令 ID: ${cmdId} 在当前世界观 "${selectedWorldview}" 的筛选数据中`);
      }
    });

    setInteractiveStory(prev => [...prev, ...newStoryItems]);

    // 清空选择
    setSelectedChoices([]);
    setSelectedCommands([]);

    // 移动到下一层级或结束 - [关键修复] 确保层级移动时保持世界观筛选
    if (currentLayerIndex < sortedLayers.length - 1) {
      const nextLayerIndex = currentLayerIndex + 1;
      
      // [修复] 强制清除选择状态，确保进入新层级时没有残留选择
      setSelectedChoices([]);
      setSelectedCommands([]);
      
      setCurrentLayerIndex(nextLayerIndex);
      showToast(`进入第 ${nextLayerIndex + 1} 幕`);
      
      // [关键修复] 重新获取下一层级的候选选项，确保世界观筛选正确应用
      const { plays: newPlays, commands: newCommands } = getCandidatesForCurrentLayer(currentScene, nextLayerIndex);
      setCandidatePlays(newPlays);
      setCandidateCommands(newCommands);
      setIsFirstLoad(false);
    } else {
      // 故事结束，保存到历史记录
      const finalStory = [...interactiveStory, ...newStoryItems];
      setGeneratedHistory(prev => [{
        timestamp: Date.now(),
        sceneName: `${currentScene.name} (剧情走向)`,
        story: finalStory,
      }, ...prev]);
      showToast("剧情走向完成，已保存到历史记录");
      setInteractiveMode(false);
    }
  };

  // 新增：导入自定义JSON文件
  const handleImportCustomJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // 导入JSON工具函数（修复ID重复问题）
        const importFromCustomJson = (jsonContent, currentData) => {
          try {
            const data = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
            
            if (!Array.isArray(data)) {
              showToast("JSON文件格式错误：应为数组格式", "error");
              return null;
            }

            let totalImported = {
              scenes: 0,
              layers: 0,
              plays: 0,
              commands: 0
            };

            // 处理每个数据集
            const result = {
              scenes: [...(currentData.scenes || [])],
              layers: [...(currentData.layers || [])],
              plays: [...(currentData.plays || [])],
              commands: [...(currentData.commands || [])]
            };

            data.forEach((dataset, datasetIndex) => {
              // [修复] 为每个数据集提取世界观名称（支持多种格式）
              let worldviewName = "";
              let processedScenes = [];
              let processedLayers = [];
              let processedPlays = [];
              let processedCommands = [];
              
              // 支持新的格式：{ worldviewName: "", scenarios: [] }
              if (dataset.worldviewName && dataset.scenarios) {
                worldviewName = dataset.worldviewName;
                console.log(`数据集 ${datasetIndex + 1} 使用新格式，世界观: ${worldviewName}`);
                
                // 将 scenarios 转换为 scenes 格式
                processedScenes = dataset.scenarios.map(scenario => ({
                  id: scenario.id,
                  name: scenario.title,
                  description: scenario.description,
                  worldview: scenario.worldview || worldviewName,
                  tags: [],
                  // 如果有choices，可以保存为额外信息
                  choices: scenario.choices || []
                }));
              } else {
                // 支持原有格式
                // 优先使用数据集中的worldview字段
                if (dataset.worldview) {
                  worldviewName = dataset.worldview;
                  console.log(`数据集 ${datasetIndex + 1} 使用指定世界观: ${worldviewName}`);
                } else if (dataset.scenes && dataset.scenes.length > 0 && dataset.scenes[0].worldview) {
                  worldviewName = dataset.scenes[0].worldview;
                  console.log(`数据集 ${datasetIndex + 1} 使用场景世界观: ${worldviewName}`);
                } else if (dataset.scenes && dataset.scenes.length > 0 && dataset.scenes[0].name) {
                  // 尝试从场景名称中提取世界观（去掉具体的地点描述）
                  const sceneName = dataset.scenes[0].name;
                  if (sceneName.includes('王勇和体育生')) {
                    worldviewName = '王勇和体育生故事';
                  } else if (sceneName.includes('月王')) {
                    worldviewName = '月王故事';
                  } else {
                    // 提取场景名称的前几个字符作为世界观
                    worldviewName = sceneName.length > 10 ? sceneName.substring(0, 10) : sceneName;
                  }
                  console.log(`数据集 ${datasetIndex + 1} 从场景名称推断世界观: ${worldviewName}`);
                } else if (dataset.layers && dataset.layers.length > 0 && dataset.layers[0].layer_name) {
                  worldviewName = dataset.layers[0].layer_name;
                  console.log(`数据集 ${datasetIndex + 1} 使用层级名称作为世界观: ${worldviewName}`);
                } else {
                  worldviewName = `数据集${datasetIndex + 1}`;
                  console.log(`数据集 ${datasetIndex + 1} 使用默认世界观: ${worldviewName}`);
                }
                
                // 使用原有数据
                processedScenes = dataset.scenes || [];
                processedLayers = dataset.layers || [];
                processedPlays = dataset.plays || [];
                processedCommands = dataset.commands || [];
              }

              // 修复：为每个数据集生成唯一且递增的ID
              
              // [修复] 获取当前数据集的首字母作为ID前缀
              let groupPrefix = '';
              if (processedScenes && processedScenes.length > 0 && processedScenes[0].name) {
                groupPrefix = chineseToFirstLetters(processedScenes[0].name);
              } else if (processedLayers && processedLayers.length > 0 && processedLayers[0].layer_name) {
                groupPrefix = chineseToFirstLetters(processedLayers[0].layer_name);
              } else if (processedScenes && processedScenes.length > 0 && processedScenes[0].title) {
                groupPrefix = chineseToFirstLetters(processedScenes[0].title);
              } else {
                groupPrefix = 'AAA'; // 默认前缀
              }

              // 处理场景
              if (processedScenes && Array.isArray(processedScenes) && processedScenes.length > 0) {
                const existingSceneIds = result.scenes.map(s => s.id);
                const scenesWithNewIds = [];
                
                processedScenes.forEach((scene, index) => {
                  // [关键修复] 动态更新现有ID列表，确保每个场景获得唯一ID
                  const currentExistingIds = [...existingSceneIds, ...scenesWithNewIds.map(s => s.id)];
                  const newId = generateSequentialId('S', currentExistingIds, groupPrefix, 'scene', worldviewName);
                  scenesWithNewIds.push({
                    ...scene,
                    id: newId,
                    worldview: worldviewName // [新增] 添加世界观字段
                  });
                });
                
                result.scenes.push(...scenesWithNewIds);
                totalImported.scenes += scenesWithNewIds.length;
              }

              // 处理层级
              if (processedLayers && Array.isArray(processedLayers) && processedLayers.length > 0) {
                const existingLayerIds = result.layers.map(l => l.layer_id);
                const layersWithNewIds = [];
                
                processedLayers.forEach((layer, index) => {
                  // [关键修复] 动态更新现有ID列表，确保每个层级获得唯一ID
                  const currentExistingIds = [...existingLayerIds, ...layersWithNewIds.map(l => l.layer_id)];
                  const newId = generateSequentialId('L', currentExistingIds, groupPrefix, 'layer', worldviewName);
                  layersWithNewIds.push({
                    ...layer,
                    layer_id: newId,
                    worldview: worldviewName // [新增] 添加世界观字段
                  });
                });
                
                result.layers.push(...layersWithNewIds);
                totalImported.layers += layersWithNewIds.length;
              }

              // 处理玩法
              if (processedPlays && Array.isArray(processedPlays) && processedPlays.length > 0) {
                const existingPlayIds = result.plays.map(p => p.id);
                const playsWithNewIds = [];
                
                processedPlays.forEach((play, index) => {
                  // [关键修复] 动态更新现有ID列表，确保每个玩法获得唯一ID
                  const currentExistingIds = [...existingPlayIds, ...playsWithNewIds.map(p => p.id)];
                  const newId = generateSequentialId('P', currentExistingIds, groupPrefix, 'play', worldviewName);
                  playsWithNewIds.push({
                    ...play,
                    id: newId,
                    // 修复外键关联：更新fk_layer_id指向新的层级ID（传递worldviewName）
                    fk_layer_id: updateForeignKey(play.fk_layer_id, processedLayers, result.layers, worldviewName),
                    worldview: worldviewName // [新增] 添加世界观字段
                  });
                });
                
                result.plays.push(...playsWithNewIds);
                totalImported.plays += playsWithNewIds.length;
              }

              // 处理指令
              if (processedCommands && Array.isArray(processedCommands) && processedCommands.length > 0) {
                const existingCommandIds = result.commands.map(c => c.id);
                const commandsWithNewIds = [];
                
                processedCommands.forEach((command, index) => {
                  // [关键修复] 动态更新现有ID列表，确保每个指令获得唯一ID
                  const currentExistingIds = [...existingCommandIds, ...commandsWithNewIds.map(c => c.id)];
                  const newId = generateSequentialId('C', currentExistingIds, groupPrefix, 'command', worldviewName);
                  commandsWithNewIds.push({
                    ...command,
                    id: newId,
                    // 修复外键关联：更新fk_target_id指向新的场景/层级ID（传递worldviewName）
                    fk_target_id: updateTargetIds(command.fk_target_id, command.scope_type, 
                                                processedScenes, processedLayers, 
                                                result.scenes, result.layers, worldviewName),
                    worldview: worldviewName // [新增] 添加世界观字段
                  });
                });
                
                result.commands.push(...commandsWithNewIds);
                totalImported.commands += commandsWithNewIds.length;
              }
            });

            const summary = `成功导入 ${data.length} 个数据集（修复ID重复）：场景 ${totalImported.scenes} 个，层级 ${totalImported.layers} 个，玩法 ${totalImported.plays} 个，指令 ${totalImported.commands} 个`;
            
            return {
              data: result,
              summary: summary
            };
          } catch (error) {
            console.error("JSON解析错误:", error);
            showToast(`JSON解析失败: ${error.message}`, "error");
            return null;
          }
        };

        // 辅助函数：更新外键关联
        const updateForeignKey = (oldLayerId, datasetLayers, resultLayers, worldviewName) => {
          if (!oldLayerId) return oldLayerId;
          
          // 查找原始数据集中对应的层级
          const originalLayer = datasetLayers?.find(l => l.layer_id === oldLayerId);
          if (!originalLayer) return oldLayerId;
          
          // 在结果中找到对应的新层级（包含世界观匹配）
          const newLayer = resultLayers.find(l => l.layer_name === originalLayer.layer_name && 
                                                  l.sequence === originalLayer.sequence &&
                                                  l.worldview === worldviewName);
          return newLayer ? newLayer.layer_id : oldLayerId;
        };

        // 辅助函数：更新指令的目标ID列表
        const updateTargetIds = (oldTargetIds, scopeType, datasetScenes, datasetLayers,
                                resultScenes, resultLayers, worldviewName) => {
          if (!oldTargetIds) return oldTargetIds;
          
          const targetIdArray = oldTargetIds.split(',').map(id => id.trim()).filter(Boolean);
          
          const updatedIds = targetIdArray.map(id => {
            if (scopeType === 'SCENE') {
              const originalScene = datasetScenes?.find(s => s.id === id);
              if (!originalScene) return id;
              // 修复：匹配场景时使用更严格的条件（使用当前数据集的世界观名称）
              const newScene = resultScenes.find(s => 
                s.name === originalScene.name && 
                s.worldview === worldviewName
              );
              return newScene ? newScene.id : id;
            } else if (scopeType === 'LAYER') {
              const originalLayer = datasetLayers?.find(l => l.layer_id === id);
              if (!originalLayer) return id;
              // 修复：匹配层级时使用更严格的条件（使用当前数据集的世界观名称）
              const newLayer = resultLayers.find(l => 
                l.layer_name === originalLayer.layer_name && 
                l.sequence === originalLayer.sequence &&
                l.worldview === worldviewName
              );
              return newLayer ? newLayer.layer_id : id;
            }
            return id;
          });
          
          return updatedIds.join(',');
        };

        const currentData = { scenes, layers, plays, commands };
        const importResult = importFromCustomJson(event.target.result, currentData);
        
        if (importResult) {
          setScenes(importResult.data.scenes);
          setLayers(importResult.data.layers);
          setPlays(importResult.data.plays);
          setCommands(importResult.data.commands);
          setSelectedSceneId(""); // [修复] 重置场景选择
          setSelectedWorldview(""); // [修复] 重置世界观选择
          setEnableWorldviewFilter(false); // [修复] 关闭世界观筛选
          showToast(importResult.summary);
          setGeneratedHistory([]); // 清空历史记录以保持数据一致性
        }
      } catch (error) {
        showToast(`文件处理失败: ${error.message}`, "error");
      }
    };
    reader.readAsText(file);
  };

  // --- 渲染模态框内容 (略) ---
  const renderModalContent = () => {
    const item = editingItem || {};
    const title = modalMode === 'add' ? `新增 ${targetType === 'scene' ? '场景' : targetType === 'layer' ? '层级' : targetType === 'play' ? '玩法' : '指令'}` : (modalMode === 'edit' ? `编辑 ${item.name || item.layer_name}` : (modalMode === 'batch' ? `批量导入 ${targetType === 'scene' ? '场景' : targetType === 'play' ? '玩法' : '指令'}` : '历史记录'));

    if (modalMode === 'history') {
      return { title: '历史生成记录', content: renderHistoryModal() };
    }

    if (modalMode === 'batch') {
      const examples = {
        scene: "名称 | 描述 | 标签1,标签2\n废弃仓库 | 阴暗潮湿，地板上布满铁锈。 [室内, 恐怖] |",
        play: "名称 | 描述 | 结果 | 层级ID (如L2_CORE) | 标签\n修好电闸 | 找到电闸并成功修复。 | 恢复照明 | L1_SETUP | 电力, 辅助",
        // V1.3.7 示例：指令的目标ID也支持逗号分隔
        command: "名称 | 描述 | 概率 | 作用域 (GLOBAL/SCENE/LAYER) | 目标ID (S001,S002 或 L1_SETUP,L2_CORE)\n怪物嘶吼 | 远处传来令人毛骨悚然的吼叫。 | 10 | SCENE | S001,S002"
      };

      return {
        title: title,
        content: (
          <form onSubmit={handleSave}>
            <p className="text-sm text-slate-500 mb-3">
              请按行输入数据，字段间使用 **`|`** 或 **`:`** 分隔。
              <span className="text-indigo-600 font-medium ml-1">场景导入支持智能识别描述末尾的 `[]` 或 `()` 内的标签。</span>
            </p>
            <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono mb-4">
              <span className="font-semibold text-slate-700 block mb-1">格式示例 ({targetType}):</span>
              {examples[targetType]}
            </div>

            {/* [新增] 批量导入世界观输入框 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                批量导入世界观（可选）
              </label>
              <input
                type="text"
                value={batchWorldview}
                onChange={(e) => setBatchWorldview(e.target.value)}
                placeholder="例如：现代都市、奇幻世界（留空则自动推断）"
                className="w-full border border-slate-300 rounded-lg p-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                如果留空，系统会根据导入内容自动推断世界观，或使用默认场景的世界观
              </p>
            </div>
            
            {/* [新增] 批量导入玩法目标层级 */}
            {targetType === 'play' && layers.length > 0 && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">批量导入的目标层级 (统一设置，文本行可覆盖)</label>
                    <select 
                        value={batchLayerId} 
                        onChange={(e) => setBatchLayerId(e.target.value)} 
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white" 
                        required
                    >
                        {layers.map(l => (
                            <option key={l.layer_id} value={l.layer_id}>{l.sequence}. {l.layer_name} ({l.layer_id})</option>
                        ))}
                    </select>
                </div>
            )}
            
            {/* [V1.3.9 新增] 批量导入指令默认作用域选择 */}
            {targetType === 'command' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">批量导入的默认作用域 (统一设置，文本行可覆盖)</label>
                    <select 
                        value={batchCommandScope} 
                        onChange={(e) => {
                            setBatchCommandScope(e.target.value);
                            // 作用域改变时清空已选的目标
                            setBatchCommandTargetIdsArray([]); 
                        }} 
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white" 
                        required
                    >
                        <option value="GLOBAL">GLOBAL (全局生效)</option>
                        <option value="SCENE">SCENE (特定场景)</option>
                        <option value="LAYER">LAYER (特定层级)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">如果文本行中未指定作用域，将使用此默认值。</p>
                </div>
            )}
            
            {/* [V1.3.12 关键修改] 批量导入指令默认目标ID - 使用选择列表 */}
            {targetType === 'command' && (batchCommandScope === 'SCENE' || batchCommandScope === 'LAYER') && (
                <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        默认目标ID (可多选)
                    </label>
                    {batchCommandScope === 'SCENE' && (
                        <CheckboxList
                            name="batch_scene_target"
                            options={scenes.map(s => ({ id: s.id, name: `${s.name} (${s.id})` }))}
                            selectedValues={batchCommandTargetIdsArray}
                            onChange={setBatchCommandTargetIdsArray}
                        />
                    )}
                    {batchCommandScope === 'LAYER' && (
                        <CheckboxList
                            name="batch_layer_target"
                            options={layers.map(l => ({ id: l.layer_id, name: `${l.sequence}. ${l.layer_name} (${l.layer_id})` }))}
                            selectedValues={batchCommandTargetIdsArray}
                            onChange={setBatchCommandTargetIdsArray}
                        />
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                        所选 ID 将作为默认值应用于作用域为 **{batchCommandScope === 'SCENE' ? '特定场景' : '特定层级'}** 且文本行中目标ID为空的指令。
                    </p>
                </div>
            )}


            <textarea
              name="batchText"
              rows="10"
              placeholder="每行一条数据..."
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            ></textarea>
            <div className="mt-4 flex justify-end">
              <Button type="submit" size="md"><Upload size={16} className="mr-2"/> 确认导入</Button>
            </div>
          </form>
        )
      };
    }

    // Add/Edit Form (略)
    return {
      title: title,
      content: (
        <form onSubmit={handleSave}>
          {targetType === 'scene' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">名称</label>
              <input type="text" name="name" defaultValue={item.name} className="w-full border border-slate-300 rounded-lg p-2" required />

              <label className="block text-sm font-medium text-slate-700">描述</label>
              <textarea name="description" defaultValue={item.description} rows="3" className="w-full border border-slate-300 rounded-lg p-2"></textarea>

              <label className="block text-sm font-medium text-slate-700">世界观</label>
              <input type="text" name="worldview" defaultValue={item.worldview || ""} placeholder="例如: 现代都市、奇幻世界" className="w-full border border-slate-300 rounded-lg p-2" />

              <label className="block text-sm font-medium text-slate-700">标签 (逗号或顿号分隔)</label>
              <input type="text" name="tags" defaultValue={(item.tags || []).join(', ')} placeholder="例如: 室内, 恐怖, 解谜" className="w-full border border-slate-300 rounded-lg p-2" />
            </div>
          )}

          {targetType === 'layer' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">层级名称</label>
              <input type="text" name="layer_name" defaultValue={item.layer_name} className="w-full border border-slate-300 rounded-lg p-2" required />

              <label className="block text-sm font-medium text-slate-700">世界观</label>
              <input type="text" name="worldview" defaultValue={item.worldview || ""} placeholder="例如: 现代都市、奇幻世界" className="w-full border border-slate-300 rounded-lg p-2" />

              <label className="block text-sm font-medium text-slate-700">执行顺序</label>
              <input type="number" name="sequence" defaultValue={item.sequence} className="w-full border border-slate-300 rounded-lg p-2" min="1" required />
            </div>
          )}

          {targetType === 'play' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">玩法名称</label>
              <input type="text" name="name" defaultValue={item.name} className="w-full border border-slate-300 rounded-lg p-2" required />

              <label className="block text-sm font-medium text-slate-700">描述 (玩家行为)</label>
              <textarea name="description" defaultValue={item.description} rows="3" className="w-full border border-slate-300 rounded-lg p-2"></textarea>

              <label className="block text-sm font-medium text-slate-700">世界观</label>
              <input type="text" name="worldview" defaultValue={item.worldview || ""} placeholder="例如: 现代都市、奇幻世界" className="w-full border border-slate-300 rounded-lg p-2" />

              <label className="block text-sm font-medium text-slate-700">预期结果</label>
              <input type="text" name="result" defaultValue={item.result} className="w-full border border-slate-300 rounded-lg p-2" required />

              <label className="block text-sm font-medium text-slate-700">触发条件 (可选)</label>
              <input type="text" name="trigger_condition" defaultValue={item.trigger_condition} className="w-full border border-slate-300 rounded-lg p-2" />

              <label className="block text-sm font-medium text-slate-700">所属层级</label>
              <select name="fk_layer_id" defaultValue={item.fk_layer_id || (layers[0]?.layer_id)} className="w-full border border-slate-300 rounded-lg p-2" required>
                {layers.map(l => (
                  <option key={l.layer_id} value={l.layer_id}>{l.sequence}. {l.layer_name} ({l.layer_id})</option>
                ))}
              </select>

              <label className="block text-sm font-medium text-slate-700">标签 (逗号或顿号分隔)</label>
              <input type="text" name="tags" defaultValue={(item.tags || []).join(', ')} placeholder="例如: 战斗, 室内, 生存" className="w-full border border-slate-300 rounded-lg p-2" />
            </div>
          )}

          {targetType === 'command' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">指令名称</label>
              <input type="text" name="name" defaultValue={item.name} className="w-full border border-slate-300 rounded-lg p-2" required />

              <label className="block text-sm font-medium text-slate-700">世界观</label>
              <input type="text" name="worldview" defaultValue={item.worldview || ""} placeholder="例如: 现代都市、奇幻世界" className="w-full border border-slate-300 rounded-lg p-2" />

              <label className="block text-sm font-medium text-slate-700">描述/效果</label>
              <textarea name="description" defaultValue={item.description} rows="3" className="w-full border border-slate-300 rounded-lg p-2"></textarea>

              <label className="block text-sm font-medium text-slate-700">触发概率 (%)</label>
              <input type="number" name="probability" defaultValue={item.probability || 20} className="w-full border border-slate-300 rounded-lg p-2" min="1" max="100" required />

              <label className="block text-sm font-medium text-slate-700">作用域</label>
              <select
                name="scope_type"
                defaultValue={item.scope_type || 'GLOBAL'}
                className="w-full border border-slate-300 rounded-lg p-2"
                // V1.3.7 优化：作用域变化时，重置目标 ID 状态
                onChange={(e) => {
                  setCommandScopeType(e.target.value);
                  setCommandTargetIds([]);
                }}
                required
              >
                <option value="GLOBAL">GLOBAL (全局)</option>
                <option value="SCENE">SCENE (特定场景)</option>
                <option value="LAYER">LAYER (特定层级)</option>
              </select>

              {/* V1.3.7 关键修复: 动态目标ID输入 (改为多选框列表，支持 SCENE 和 LAYER 多选) */}
              {commandScopeType !== 'GLOBAL' && (
                <>
                  <label className="block text-sm font-medium text-slate-700">目标 ID / 名称</label>
                  {commandScopeType === 'SCENE' && (
                    <CheckboxList
                      name="fk_target_id"
                      options={scenes.map(s => ({ id: s.id, name: `${s.name} (${s.id})` }))}
                      selectedValues={commandTargetIds}
                      onChange={setCommandTargetIds}
                      required
                    />
                  )}
                  {commandScopeType === 'LAYER' && (
                    <CheckboxList 
                      name="fk_target_id"
                      // LAYER 现在也支持多选
                      options={layers.map(l => ({ id: l.layer_id, name: `${l.sequence}. ${l.layer_name} (${l.layer_id})` }))}
                      selectedValues={commandTargetIds}
                      onChange={setCommandTargetIds}
                      required
                    />
                  )}
                </>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>取消</Button>
            <Button type="submit">
              <Save size={16} className="mr-2"/> 保存
            </Button>
          </div>
        </form>
      )
    };
  };

  // --- 渲染历史记录模态框 (V1.3.16 重点修改此函数) ---
  const renderHistoryModal = () => (
    <div className="space-y-4">
      {/* V1.3.13 优化：顶部布局，支持批量导出 */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <div className="text-sm text-slate-500">
          总共保存了 {generatedHistory.length} 条历史故事记录
        </div>
        {generatedHistory.length > 0 && (
          <div className="flex space-x-2">
            <Button
                variant="secondary"
                size="sm"
                onClick={exportAllHistoryToTxt} // <-- 批量导出
            >
                <Download size={14} className="mr-1"/> 批量导出 TXT
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openDeleteConfirmation('ALL_HISTORY', 'history', '所有历史记录')}
            >
              <Trash2 size={14} className="mr-1"/> 清空历史
            </Button>
          </div>
        )}
      </div>

      {generatedHistory.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <History size={48} className="mx-auto mb-2 opacity-20" />
          <p>暂无历史生成记录</p>
          <p className="text-xs mt-1">生成故事后会自动保存到这里</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          {generatedHistory.map((historyItem) => (
            <Card key={historyItem.timestamp} className="p-4 border-l-4 border-l-indigo-300 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                
                {/* V1.3.16 标题和编辑区域 */}
                <div className="flex flex-col items-start w-full pr-4">
                    <div className="flex items-center space-x-2">
                        {editingHistoryId === historyItem.timestamp ? (
                            <input
                                type="text"
                                value={tempHistoryTitle}
                                onChange={(e) => setTempHistoryTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleEditHistoryTitle(historyItem.timestamp, tempHistoryTitle);
                                    }
                                }}
                                onBlur={() => handleEditHistoryTitle(historyItem.timestamp, tempHistoryTitle)}
                                className="text-base font-bold text-slate-800 border border-indigo-400 rounded px-1 py-0.5 focus:outline-none w-full"
                                autoFocus
                            />
                        ) : (
                            <h4
                                className="font-bold text-slate-800 flex items-center cursor-pointer hover:text-indigo-600 transition-colors"
                                onClick={() => {
                                    setEditingHistoryId(historyItem.timestamp);
                                    setTempHistoryTitle(historyItem.sceneName);
                                }}
                                title="点击编辑故事简称"
                            >
                                {historyItem.sceneName}
                                <Edit3 size={14} className="ml-2 text-indigo-400 opacity-70 hover:opacity-100 flex-shrink-0" />
                            </h4>
                        )}
                        <Badge size="sm" color="blue" className="flex-shrink-0">
                            {historyItem.story.length} 步
                        </Badge>
                    </div>
                    {/* V1.3.2 新增: 生成时间 */}
                    <p className="text-xs text-slate-500 mt-1">
                        生成时间: {new Date(historyItem.timestamp).toLocaleString()}
                    </p>
                </div>

                {/* 按钮组 */}
                <div className="flex space-x-1 flex-shrink-0">
                  {/* V1.3.2 新增: 复制按钮 */}
                  <Button
                    size="icon"
                    variant="secondary"
                    title="复制文本到剪贴板"
                    onClick={() => copyStoryToClipboard(historyItem.story, historyItem.timestamp)}
                    className={copiedId === historyItem.timestamp ? 'text-green-600 bg-green-50 border-green-100' : ''}
                  >
                    {copiedId === historyItem.timestamp ? <Check size={16}/> : <Copy size={16}/>}
                  </Button>

                  <Button
                    size="icon"
                    variant="secondary"
                    title="导出为 TXT"
                    onClick={() => exportStoryToTxt(historyItem.story, historyItem.sceneName)}
                  >
                    <Download size={16}/>
                  </Button>

                  <Button
                    size="icon"
                    variant="lightDanger"
                    title="删除此记录"
                    onClick={() => handleDeleteHistory(historyItem.timestamp, historyItem.sceneName)}
                  >
                    <Trash2 size={16}/>
                  </Button>
                </div>
              </div>

              {/* V1.3.2 新增: 内容预览 */}
              <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-md font-mono mt-3">
                {getStoryPreview(historyItem.story)}
              </div>

              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setGeneratedStory(historyItem.story);
                    setModalOpen(false);
                    setActiveTab('generator');
                    showToast("历史故事已加载");
                  }}
                >
                  <History size={14} className="mr-1"/> 加载到主面板
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // --- 渲染删除确认模态框 (V1.3.19 修复层级) ---
  const renderConfirmModal = () => {
    if (!confirmingDelete) return null;

    // 处理清空所有历史记录的确认
    const isClearHistory = confirmingDelete.type === 'history' && confirmingDelete.id === 'ALL_HISTORY';
    const title = confirmingDelete.type === 'ALL' ? "重置所有数据" : (isClearHistory ? "清空历史记录" : "确认删除");
    const message = confirmingDelete.type === 'ALL'
      ? "你确定要清空所有数据（场景、层级、玩法、指令和历史记录）吗？此操作不可恢复。"
      : (isClearHistory
        ? "你确定要删除所有历史生成记录吗？此操作不可恢复。"
        : `你确定要删除 **${confirmingDelete.name}** 吗？此操作不可恢复。`);

    return (
      <Modal 
        isOpen={!!confirmingDelete} 
        onClose={() => setConfirmingDelete(null)} 
        title={title}
        zIndex={52} // V1.3.19 关键修改：将层级提升到 52，内容层级为 53，确保高于主模态框的 50/51
      >
        <div className="flex items-center space-x-3">
          <AlertTriangle size={24} className="text-red-500 flex-shrink-0" />
          <p className="text-slate-700">
            {message}
          </p>
        </div>
        <div className="flex justify-end space-x-3 mt-4">
          <Button variant="secondary" onClick={() => setConfirmingDelete(null)}>取消</Button>
          <Button variant="danger" onClick={executeDelete}>
            <Trash2 size={16} className="mr-2"/> {confirmingDelete.type === 'ALL' ? "清空所有" : (isClearHistory ? "清空记录" : "确认删除")}
          </Button>
        </div>
      </Modal>
    );
  };

  // --- 渲染列表视图 (略) ---
  const renderSceneList = () => (
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-xl font-bold text-slate-800 flex items-center"><MapPin size={22} className="mr-2"/> 场景管理</h2>
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" onClick={() => openBatch('scene')}><ListPlus size={16} className="mr-1"/> 批量</Button>
          <Button size="sm" onClick={() => openAdd('scene')}><Plus size={16} className="mr-1"/> 新增</Button>
        </div>
      </div>
      {scenes.map(scene => (
        <Card key={scene.id} className="relative group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-800">{scene.name}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{scene.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {scene.tags.map(t => <Badge key={t} color="blue">{t}</Badge>)}
              </div>
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              <button onClick={() => openEdit(scene, 'scene')} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 size={18}/></button>
              <button onClick={() => openDeleteConfirmation(scene.id, 'scene', scene.name)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18}/></button>
            </div>
          </div>
          <div className="absolute top-2 right-2 opacity-10 text-[10px]">{scene.id}</div>
        </Card>
      ))}
    </div>
  );

  const renderLayerList = () => (
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-xl font-bold text-slate-800 flex items-center"><Layers size={22} className="mr-2"/> 玩法层级</h2>
        <Button size="sm" onClick={() => openAdd('layer')}><Plus size={16} className="mr-1"/> 新增层级</Button>
      </div>
      {[...layers].sort((a,b) => a.sequence - b.sequence).map((layer) => (
        <Card key={layer.layer_id} className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
              {layer.sequence}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{layer.layer_name}</h3>
              <span className="text-xs text-slate-400 font-mono">{layer.layer_id}</span>
            </div>
          </div>
          <div className="flex space-x-1 flex-shrink-0">
            <button onClick={() => openEdit(layer, 'layer')} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 size={18}/></button>
            <button onClick={() => openDeleteConfirmation(layer.layer_id, 'layer', layer.layer_name)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18}/></button>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderPlayList = () => (
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-xl font-bold text-slate-800 flex items-center"><BookOpen size={22} className="mr-2"/> 玩法库</h2>
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" onClick={() => openBatch('play')}><ListPlus size={16} className="mr-1"/> 批量</Button>
          <Button size="sm" onClick={() => openAdd('play')}><Plus size={16} className="mr-1"/> 新增</Button>
        </div>
      </div>
      
      {/* [修复] 获取所有玩法关联的层级，包括动态层级 */}
      {(() => {
        // 获取筛选后的层级数据
        const filteredLayers = enableWorldviewFilter && selectedWorldview 
          ? layers.filter(l => l.worldview === selectedWorldview)
          : layers;
        
        // 按sequence排序
        const sortedLayers = [...filteredLayers].sort((a, b) => a.sequence - b.sequence);
        
        // 获取筛选后的玩法数据
        const filteredPlays = filterByWorldview(plays, 'play');
        
        // [关键修复] 收集所有玩法关联的层级ID，包括不存在的层级
        const allLayerIdsFromPlays = [...new Set(filteredPlays.map(p => p.fk_layer_id))];
        
        // [关键修复] 为不存在的层级创建虚拟层级条目
        const virtualLayers = allLayerIdsFromPlays
          .filter(layerId => !sortedLayers.find(l => l.layer_id === layerId))
          .map(layerId => ({
            layer_id: layerId,
            layer_name: `未知层级 (${layerId})`,
            sequence: 999, // 放在最后
            isVirtual: true, // 标记为虚拟层级
            worldview: filteredPlays.find(p => p.fk_layer_id === layerId)?.worldview || ""
          }));
        
        // 合并真实层级和虚拟层级
        const allLayers = [...sortedLayers, ...virtualLayers].sort((a, b) => a.sequence - b.sequence);
        
        return allLayers.map(layer => {
          const layerPlays = filteredPlays.filter(p => p.fk_layer_id === layer.layer_id);
          if (layerPlays.length === 0) return null;
          
          return (
            <div key={layer.layer_id} className="mb-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1 flex items-center">
                {layer.layer_name}
                {layer.isVirtual && (
                  <Badge color="orange" className="ml-2 text-xs">
                    层级不存在
                  </Badge>
                )}
                {layer.worldview && (
                  <Badge color="slate" className="ml-2 text-xs">
                    {layer.worldview}
                  </Badge>
                )}
              </h3>
              {layerPlays.map(play => (
                <Card key={play.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{play.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">{play.description}</p>
                      <div className="mt-2 text-xs text-slate-500">
                        <span className="font-semibold">结果:</span> {play.result}
                      </div>
                      {play.worldview && (
                        <div className="mt-1">
                          <Badge color="slate" className="text-xs">
                            {play.worldview}
                          </Badge>
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {play.tags.map(t => <Badge key={t} color="purple">{t}</Badge>)}
                      </div>
                      {/* [新增] 显示层级ID信息，帮助调试 */}
                      <div className="mt-1 text-xs text-slate-400 font-mono">
                        层级ID: {play.fk_layer_id}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1 flex-shrink-0 ml-4">
                      <button onClick={() => openEdit(play, 'play')} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 size={16}/></button>
                      <button onClick={() => openDeleteConfirmation(play.id, 'play', play.name)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        });
      })()}
    </div>
  );

  const renderCommandList = () => (
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-xl font-bold text-slate-800 flex items-center"><Zap size={22} className="mr-2"/> 场外指令</h2>
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" onClick={() => openBatch('command')}><ListPlus size={16} className="mr-1"/> 批量</Button>
          <Button size="sm" onClick={() => openAdd('command')}><Plus size={16} className="mr-1"/> 新增</Button>
        </div>
      </div>
      {commands.map(cmd => {
        let targetName = "N/A";
        const targetIds = cmd.fk_target_id ? cmd.fk_target_id.split(',').map(id => id.trim()).filter(Boolean) : [];

        if (cmd.scope_type === 'SCENE' && targetIds.length > 0) {
            // 场景多选
            const targetNames = targetIds.map(id => scenes.find(s => s.id === id)?.name || id);
            targetName = targetNames.join(', ');
        } else if (cmd.scope_type === 'LAYER' && targetIds.length > 0) {
          // V1.3.7 修复：层级多选
          const targetNames = targetIds.map(id => layers.find(l => l.layer_id === id)?.layer_name || id);
          targetName = targetNames.join(', ');
        }

        return (
          <Card key={cmd.id} className="border-l-4 border-l-amber-400">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-800">{cmd.name}</h3>
                  <Badge color="orange">{cmd.probability}%</Badge>
                  <Badge color="slate">{cmd.scope_type}</Badge>
                </div>
                <p className="text-sm text-slate-600 mt-1">{cmd.description}</p>
                {cmd.scope_type !== 'GLOBAL' && (
                  <div className="mt-1 text-xs text-slate-400 font-mono">
                    目标: {targetName}
                  </div>
                )}
              </div>
              <div className="flex space-x-1 flex-shrink-0">
                 <button onClick={() => openEdit(cmd, 'command')} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 size={18}/></button>
                 <button onClick={() => openDeleteConfirmation(cmd.id, 'command', cmd.name)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18}/></button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderGenerator = () => {
    if (interactiveMode) {
      return renderInteractiveMode();
    }

    return (
      <div className="space-y-6 pb-24">
        <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
          <h2 className="text-2xl font-bold mb-4 flex items-center"><Play className="mr-2"/> 开始生成</h2>
          <div className="space-y-3">
            {/* [新增] 世界观选择器 */}
            <div className="space-y-2">
              <label className="text-sm text-indigo-100 font-medium">世界观筛选（可选）</label>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="worldview-filter"
                  checked={enableWorldviewFilter}
                  onChange={(e) => setEnableWorldviewFilter(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="worldview-filter" className="text-sm text-indigo-100 cursor-pointer">
                  启用世界观筛选
                </label>
              </div>
              {enableWorldviewFilter && (
                <select
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                  value={selectedWorldview}
                  onChange={(e) => {
                    setSelectedWorldview(e.target.value);
                    setSelectedSceneId(""); // 重置场景选择
                  }}
                >
                  <option value="" className="text-slate-800">-- 请选择世界观 --</option>
                  {getAvailableWorldviews().map(wv => (
                    <option key={wv} value={wv} className="text-slate-800">{wv}</option>
                  ))}
                </select>
              )}
            </div>
            
            <label className="text-sm text-indigo-100 font-medium">选择起始场景</label>
            <select
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-white/50"
              value={selectedSceneId}
              onChange={(e) => {
                const newSceneId = e.target.value;
                if (newSceneId && enableWorldviewFilter && selectedWorldview) {
                  const scene = scenes.find(s => s.id === newSceneId);
                  if (scene && scene.worldview !== selectedWorldview) {
                    showToast(`场景"${scene.name}"不属于当前世界观"${selectedWorldview}"`, "error");
                    return; // 阻止选择不匹配的场景
                  }
                }
                setSelectedSceneId(newSceneId);
              }}
            >
              <option value="" className="text-slate-800">-- 请选择 --</option>
              {/* [关键修复] 应用世界观筛选到起始场景选择器 */}
              {(() => {
                const filteredScenes = filterByWorldview(scenes, 'scene');
                console.log('场景选择器筛选结果:', filteredScenes);
                return filteredScenes.map(s => (
                  <option key={s.id} value={s.id} className="text-slate-800">
                    {s.name} {s.worldview ? `(${s.worldview})` : ''}
                  </option>
                ));
              })()}
            </select>
            
            {/* 双模式按钮布局 */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button
                variant="secondary"
                size="lg"
                className="font-bold bg-white text-slate-700 hover:bg-slate-50"
                onClick={handleGenerateStory}
                disabled={!selectedSceneId || scenes.length === 0 || layers.length === 0 || plays.length === 0}
              >
                <FileText size={18} className="mr-2" />
                一键生成流程
                <div className="text-xs opacity-70 mt-1">快速模式</div>
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                className="font-bold bg-white text-blue-800 hover:bg-blue-50 border border-blue-200"
                onClick={startInteractiveMode}
                disabled={!selectedSceneId || scenes.length === 0 || layers.length === 0 || plays.length === 0}
              >
                <MapPin size={18} className="mr-2" />
                开启剧情走向
                <div className="text-xs opacity-70 mt-1">沉浸模式</div>
              </Button>
            </div>
          </div>
        </div>

      {/* V1.3.18 修复：移除条件判断，始终允许点击 openHistory，确保弹出模态框 */}
      <Card 
        className={`bg-slate-100 p-3 flex items-center justify-between cursor-pointer hover:bg-slate-200`} 
        onClick={openHistory} // <-- 无条件触发 openHistory
      >
          <div className="flex items-center space-x-2 text-slate-700">
            <History size={16}/>
            <span className="font-semibold text-sm">历史记录</span>
          </div>
          <Badge color="slate">{generatedHistory.length} 条</Badge>
      </Card>


      {/* 生成结果显示 */}
      {generatedStory.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="font-bold text-slate-800">当前生成结果</h3>
            <div className="flex space-x-2">
              {/* V1.3.2 新增: 为当前结果添加复制按钮 */}
              <button
                onClick={() => copyStoryToClipboard(generatedStory, 'current')}
                className="text-xs text-indigo-600 font-medium hover:underline flex items-center"
              >
                <Copy size={14} className="mr-1"/> 复制文本
              </button>
              <button
                  onClick={() => exportStoryToTxt(generatedStory, `当前故事`)}
                  className="text-xs text-indigo-600 font-medium hover:underline flex items-center"
              >
                <Download size={14} className="mr-1"/> 导出为 TXT
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {generatedStory.map((item, idx) => {
              if (item.type === 'header') return (
                <div key={idx} className="bg-slate-800 text-white p-4 rounded-xl shadow-md">
                  <div className="text-xs opacity-50 uppercase tracking-widest mb-1">SCENE</div>
                  <div className="text-xl font-bold">{item.text.replace('场景：', '')}</div>
                  <div className="text-sm opacity-80 mt-1">{item.desc}</div>
                </div>
              );
              if (item.type === 'play') return (
                <div key={idx} className="relative pl-6 border-l-2 border-slate-200 py-1">
                   <div className="absolute -left-[9px] top-3 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white"></div>
                   <div className="text-xs font-bold text-indigo-600 mb-1">{item.layerName}</div>
                   <h4 className="font-bold text-slate-800">{item.title}</h4>
                   <p className="text-sm text-slate-600">{item.content}</p>
                   <div className="mt-1 text-xs bg-slate-100 inline-block px-2 py-1 rounded text-slate-500">
                     结果: {item.result}
                   </div>
                </div>
              );
              if (item.type === 'command') return (
                <div key={idx} className="ml-6 bg-amber-50 border border-amber-100 p-3 rounded-lg my-2">
                  <div className="flex items-center text-amber-700 text-xs font-bold mb-1">
                    <Zap size={12} className="mr-1"/> 突发指令 ({item.scope})
                  </div>
                  <div className="text-sm font-medium text-slate-800">{item.title}</div>
                  <div className="text-xs text-slate-600">{item.content}</div>
                </div>
              );
              return null;
            })}
            <div className="flex justify-center pt-4 opacity-30 text-2xl">THE END</div>
          </div>
        </div>
      )}
    </div>
    );
  };

  // 新增：剧情走向模式渲染函数
  const renderInteractiveMode = () => {
    // [关键修复] 使用getCandidatesForCurrentLayer获取筛选后的数据，确保数据一致性
    const { filteredData } = getCandidatesForCurrentLayer(currentScene, currentLayerIndex);
    const filteredLayers = filteredData.layers;
    const sortedLayers = [...filteredLayers].sort((a, b) => a.sequence - b.sequence);
    
    // [关键修复] 防止索引越界，确保当前层级存在
    let currentLayer = null;
    if (currentLayerIndex >= 0 && currentLayerIndex < sortedLayers.length) {
      currentLayer = sortedLayers[currentLayerIndex];
    }
    
    // [调试信息] 添加日志帮助调试
    console.log(`渲染交互模式 - 当前世界观: ${selectedWorldview}, 筛选后层级数量: ${sortedLayers.length}`);
    if (currentLayer) {
      console.log(`当前层级: ${currentLayer.layer_name} (ID: ${currentLayer.layer_id}, 世界观: ${currentLayer.worldview})`);
    }
    
    return (
      <div className="space-y-6 pb-24">
        {/* 进度条 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold flex items-center">
              <MapPin size={18} className="mr-2" />
              第 {currentLayerIndex + 1} / {sortedLayers.length} 幕
            </h3>
            <button
              onClick={exitInteractiveMode}
              className="text-white/80 hover:text-white text-sm"
            >
              <X size={18} />
            </button>
          </div>
          <div className="text-sm opacity-90 font-medium">
            {currentLayer ? `${currentLayer.layer_name} ${currentLayer.worldview ? `(${currentLayer.worldview})` : ''}` : '未知层级'}
            {enableWorldviewFilter && selectedWorldview && (
              <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                世界观: {selectedWorldview}
              </span>
            )}
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${((currentLayerIndex + 1) / sortedLayers.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 故事进度显示 */}
        <div className="space-y-3">
          {interactiveStory.map((item, idx) => {
            if (item.type === 'header') return (
              <div key={idx} className="bg-slate-800 text-white p-4 rounded-xl shadow-md">
                <div className="text-xs opacity-50 uppercase tracking-widest mb-1">SCENE</div>
                <div className="text-xl font-bold">{item.text.replace('场景：', '')}</div>
                <div className="text-sm opacity-80 mt-1">{item.desc}</div>
              </div>
            );
            if (item.type === 'play') return (
              <div key={idx} className="relative pl-6 border-l-2 border-slate-200 py-1">
                <div className="absolute -left-[9px] top-3 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white"></div>
                <div className="text-xs font-bold text-indigo-600 mb-1">{item.layerName}</div>
                <h4 className="font-bold text-slate-800">{item.title}</h4>
                <p className="text-sm text-slate-600">{item.content}</p>
                <div className="mt-1 text-xs bg-slate-100 inline-block px-2 py-1 rounded text-slate-500">
                  结果: {item.result}
                </div>
              </div>
            );
            if (item.type === 'command') return (
              <div key={idx} className="ml-6 bg-amber-50 border border-amber-100 p-3 rounded-lg my-2">
                <div className="flex items-center text-amber-700 text-xs font-bold mb-1">
                  <Zap size={12} className="mr-1" /> 突发指令 ({item.scope})
                </div>
                <div className="text-sm font-medium text-slate-800">{item.title}</div>
                <div className="text-xs text-slate-600">{item.content}</div>
              </div>
            );
            return null;
          })}
        </div>

        {/* 候选选项 - 确保始终显示操作按钮 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          {/* 只有有候选选项时才显示选择部分 */}
          {(candidatePlays.length > 0 || candidateCommands.length > 0) ? (
            <>
              <h3 className="text-lg font-bold text-slate-800 mb-4">选择你的行动</h3>
              
              {/* 玩法选项 */}
              {candidatePlays.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-indigo-600 mb-3">玩法选项</h4>
                  <div className="space-y-3">
                    {candidatePlays.map((play, index) => (
                      <div key={`play-${index}-${play.name || 'unnamed'}`} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                        <label className="flex items-start cursor-pointer">
                          <input
                            type="checkbox"
                            className="mt-1 mr-3 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            checked={selectedChoices.includes(play.id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              
                              logger.info('PLAY_SELECTION', '玩法选择状态变更', {
                                playId: play.id,
                                playName: play.name,
                                isChecked,
                                currentSelections: selectedChoices,
                                playScope: play.scope,
                                playWorldview: play.worldview
                              });

                              logUserAction('选择玩法', {
                                playId: play.id,
                                playName: play.name,
                                action: isChecked ? '选中' : '取消选中',
                                currentScene: currentScene?.name,
                                currentLayer: currentLayer?.layer_name,
                                layerIndex: currentLayerIndex
                              });

                              // [关键修复] 确保每次只选择一个玩法，避免多选问题
                              if (isChecked) {
                                // 先清空所有选择，然后只选择当前这一个
                                setSelectedChoices([play.id]);
                                
                                logger.info('PLAY_SELECTION', '单选玩法（清空其他选择）', {
                                  playId: play.id,
                                  playName: play.name,
                                  previousSelections: selectedChoices,
                                  newSelection: [play.id]
                                });

                                logDataChange('SELECTED_CHOICES', '单选玩法', selectedChoices, [play.id], play.id);
                              } else {
                                setSelectedChoices(prev => {
                                  const newSelection = prev.filter(id => id !== play.id);
                                  
                                  logger.info('PLAY_SELECTION', '从选择列表移除玩法', {
                                    playId: play.id,
                                    playName: play.name,
                                    previousSelections: prev,
                                    newSelection,
                                    totalSelected: newSelection.length
                                  });

                                  logDataChange('SELECTED_CHOICES', '移除玩法', prev, newSelection, play.id);
                                  
                                  return newSelection;
                                });
                              }
                            }}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-slate-800">{play.name}</div>
                            <div className="text-sm text-slate-600 mt-1">{play.description}</div>
                            <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded mt-2 inline-block">
                              结果: {play.result}
                            </div>
                            <div className="text-xs text-slate-400 mt-1 font-mono">
                              ID: {play.id}
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 突发指令 */}
              {candidateCommands.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-amber-600 mb-3 flex items-center">
                    <Zap size={14} className="mr-1" /> 突发指令
                  </h4>
                  <div className="space-y-3">
                    {candidateCommands.map((cmd, index) => (
                      <div key={`cmd-${index}-${cmd.name || 'unnamed'}`} className="border border-amber-200 bg-amber-50 rounded-lg p-4 hover:border-amber-300 transition-colors">
                        <label className="flex items-start cursor-pointer">
                          <input
                            type="checkbox"
                            className="mt-1 mr-3 w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                            checked={selectedCommands.includes(cmd.id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              
                              logger.info('COMMAND_SELECTION', '指令选择状态变更', {
                                commandId: cmd.id,
                                commandName: cmd.name,
                                isChecked,
                                currentSelections: selectedCommands,
                                commandScope: cmd.scope_type,
                                commandWorldview: cmd.worldview
                              });

                              logUserAction('选择指令', {
                                commandId: cmd.id,
                                commandName: cmd.name,
                                action: isChecked ? '选中' : '取消选中',
                                currentScene: currentScene?.name,
                                currentLayer: currentLayer?.layer_name,
                                layerIndex: currentLayerIndex
                              });

                              // [关键修复] 允许多选指令，但修复ID重复问题
                              if (isChecked) {
                                setSelectedCommands(prev => {
                                  // [修复] 检查是否已存在相同名称的指令，避免重复
                                  const existingSameName = prev.some(id => {
                                    const existingCmd = candidateCommands.find(c => c.id === id);
                                    return existingCmd && existingCmd.name === cmd.name;
                                  });
                                  
                                  if (existingSameName) {
                                    // 如果已存在同名指令，替换为新选择的
                                    const filtered = prev.filter(id => {
                                      const existingCmd = candidateCommands.find(c => c.id === id);
                                      return !(existingCmd && existingCmd.name === cmd.name);
                                    });
                                    const newSelection = [...filtered, cmd.id];
                                    
                                    logger.info('COMMAND_SELECTION', '替换同名指令', {
                                      commandId: cmd.id,
                                      commandName: cmd.name,
                                      previousSelections: prev,
                                      newSelection,
                                      totalSelected: newSelection.length
                                    });

                                    logDataChange('SELECTED_COMMANDS', '替换指令', prev, newSelection, cmd.id);
                                    return newSelection;
                                  } else {
                                    // 正常添加新指令
                                    const newSelection = [...prev, cmd.id];
                                    
                                    logger.info('COMMAND_SELECTION', '添加指令到选择列表', {
                                      commandId: cmd.id,
                                      commandName: cmd.name,
                                      previousSelections: prev,
                                      newSelection,
                                      totalSelected: newSelection.length
                                    });

                                    logDataChange('SELECTED_COMMANDS', '添加指令', prev, newSelection, cmd.id);
                                    return newSelection;
                                  }
                                });
                              } else {
                                setSelectedCommands(prev => {
                                  const newSelection = prev.filter(id => id !== cmd.id);
                                  
                                  logger.info('COMMAND_SELECTION', '从选择列表移除指令', {
                                    commandId: cmd.id,
                                    commandName: cmd.name,
                                    previousSelections: prev,
                                    newSelection,
                                    totalSelected: newSelection.length
                                  });

                                  logDataChange('SELECTED_COMMANDS', '移除指令', prev, newSelection, cmd.id);
                                  
                                  return newSelection;
                                });
                              }
                            }}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-slate-800">{cmd.name}</div>
                            <div className="text-sm text-slate-600 mt-1">{cmd.description}</div>
                            <div className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded mt-2 inline-block">
                              作用域: {cmd.scope_type}
                            </div>
                            <div className="text-xs text-slate-400 mt-1 font-mono">
                              ID: {cmd.id}
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="text-slate-500 text-lg mb-2">当前没有可选的行动</div>
              <div className="text-slate-400 text-sm">你可以直接结束故事或返回上级</div>
            </div>
          )}

          {/* 操作按钮 - 始终显示 */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button
              variant="primary"
              size="lg"
              className="font-bold"
              onClick={handleInteractiveChoice}
              disabled={selectedChoices.length === 0 && selectedCommands.length === 0}
            >
              确认选择
              <div className="text-xs opacity-70 mt-1">
                已选择 {selectedChoices.length + selectedCommands.length} 项
              </div>
            </Button>
            
            {/* 结束故事按钮 - 始终显示 */}
            <Button
              variant="secondary"
              size="lg"
              className="bg-amber-100 text-amber-700 hover:bg-amber-200 font-bold"
              onClick={() => {
                if (typeof window !== 'undefined' && window.confirm && window.confirm(`确定要结束故事吗？当前在第 ${currentLayerIndex + 1} 幕，已选择 ${selectedChoices.length + selectedCommands.length} 项。`)) {
                  // 主动结束故事，保存当前进度
                  setGeneratedHistory(prev => [{
                    timestamp: Date.now(),
                    sceneName: `${currentScene.name} (剧情走向 - 手动结束)`,
                    story: interactiveStory,
                  }, ...prev]);
                  showToast("故事已结束并保存到历史记录");
                  setInteractiveMode(false);
                }
              }}
            >
              <Flag size={16} className="mr-1" />
              结束故事
            </Button>
          </div>
        </div>

        {/* 故事结束提示 */}
        {currentLayerIndex >= sortedLayers.length - 1 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-2xl font-bold mb-2">故事结束</h3>
            <p className="opacity-90">恭喜！你完成了整个剧情走向</p>
            <div className="flex justify-center mt-4 space-x-3">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 font-bold"
                onClick={() => {
                  setGeneratedHistory(prev => [{
                    timestamp: Date.now(),
                    sceneName: `${currentScene.name} (剧情走向)`,
                    story: interactiveStory,
                  }, ...prev]);
                  showToast("故事已保存到历史记录");
                  setInteractiveMode(false);
                }}
              >
                保存到历史记录
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="bg-amber-100 text-amber-700 hover:bg-amber-200 font-bold"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.confirm && window.confirm(`确定要结束故事吗？当前已完成所有 ${sortedLayers.length} 幕。`)) {
                    // 主动结束故事，保存当前进度
                    setGeneratedHistory(prev => [{
                      timestamp: Date.now(),
                      sceneName: `${currentScene.name} (剧情走向 - 完成)`,
                      story: interactiveStory,
                    }, ...prev]);
                    showToast("故事已结束并保存到历史记录");
                    setInteractiveMode(false);
                  }
                }}
              >
                <Flag size={16} className="mr-1" />
                结束故事
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-xl font-bold text-slate-800 flex items-center"><Settings size={22} className="mr-2"/> 数据与设置</h2>
      </div>

      <Card>
        <h3 className="font-bold text-slate-800 flex items-center"><HardDrive size={18} className="mr-2 text-indigo-600"/> 数据统计</h3>
        <p className="text-sm text-slate-500 mt-2">当前数据存储于本地浏览器。</p>
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div className="p-3 bg-slate-50 rounded-lg">场景: <Badge color="blue">{scenes.length}</Badge></div>
          <div className="p-3 bg-slate-50 rounded-lg">层级: <Badge color="green">{layers.length}</Badge></div>
          <div className="p-3 bg-slate-50 rounded-lg">玩法: <Badge color="purple">{plays.length}</Badge></div>
          <div className="p-3 bg-slate-50 rounded-lg">指令: <Badge color="orange">{commands.length}</Badge></div>
        </div>
        
        {/* 数据保存状态显示 */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">自动保存状态</span>
            <div className="flex items-center space-x-2">
              {isSaving ? (
                <span className="text-xs text-blue-600">保存中...</span>
              ) : lastSaveTime ? (
                <span className="text-xs text-green-600">
                  已保存 {new Date(lastSaveTime).toLocaleTimeString()}
                </span>
              ) : (
                <span className="text-xs text-slate-500">未保存</span>
              )}
              <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
            </div>
          </div>
        </div>
      </Card>

      {/* V1.3.15 新增: 相关下载 */}
      <Card>
        <h3 className="font-bold text-slate-800 flex items-center"><Download size={18} className="mr-2 text-indigo-600"/> 相关下载 (初始化数据)</h3>
        <p className="text-sm text-slate-500 mt-2">
            点击下载相关的初始化数据和资源文件，方便快速上手。
        </p>
        <Button 
            onClick={() => window.open('https://cowtransfer.com/s/67985f57bac44f', '_blank')} 
            size="md" 
            className="w-full mt-4"
            variant="secondary"
        >
            <Download size={16} className="mr-2"/> 相关下载
        </Button>
      </Card>

      {/* V1.3.15 新增: 分享剧本 */}
      <Card>
        <h3 className="font-bold text-slate-800 flex items-center"><Link size={18} className="mr-2 text-indigo-600"/> 分享剧本</h3>
        <p className="text-sm text-slate-500 mt-2">
            前往剧本分享页面，查看或分享更多有趣的故事剧本。
        </p>
        <Button 
            onClick={() => window.open('https://c.wss.pet/s/iqmbgn2ipoz', '_blank')} 
            size="md" 
            className="w-full mt-4"
            variant="secondary"
        >
            <Share2 size={16} className="mr-2"/> 分享剧本
        </Button>
      </Card>

      {/* V1.3.15 新增: 反馈留言 */}
      <Card>
        <h3 className="font-bold text-slate-800 flex items-center"><MessageSquare size={18} className="mr-2 text-indigo-600"/> 反馈留言</h3>
        <p className="text-sm text-slate-500 mt-2">
            提交您的使用反馈、建议或报告遇到的问题。
        </p>
        <Button 
            onClick={() => window.open('https://simplefeedback.app/feedback/kaMxISU-Nvem', '_blank')} 
            size="md" 
            className="w-full mt-4"
            variant="secondary"
        >
            <MessageSquare size={16} className="mr-2"/> 反馈留言
        </Button>
      </Card>

      {/* V1.3.8 修改: 流程分享/数据链接导出 */}
      <Card>
        <h3 className="font-bold text-slate-800 flex items-center"><Link size={18} className="mr-2 text-indigo-600"/> 流程分享 / 备份链接</h3>
        <p className="text-sm text-slate-500 mt-2">
            点击下方按钮，将所有配置数据（场景、层级、玩法、指令）生成为一个 **Data URI 链接** 并自动复制到剪贴板。该链接可用于分享或跨设备导入。
        </p>
        <Button onClick={handleExportDataLink} size="md" className="w-full mt-4" variant="secondary">
            <Copy size={16} className="mr-2"/> 复制数据共享链接
        </Button>
      </Card>

      <Card>
        <h3 className="font-bold text-slate-800 flex items-center"><Download size={18} className="mr-2 text-indigo-600"/> 导入/导出 (JSON)</h3>
        <p className="text-sm text-slate-500 mt-2">将所有数据 (场景、层级、玩法、指令) 导出为 JSON 文件，或从 JSON 文件导入。</p>

        <div className="space-y-3">
          {/* 标准JSON导入导出 */}
          <div className="flex space-x-3">
            <Button variant="secondary" size="md" onClick={() => {
              const data = { scenes, layers, plays, commands };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `text_game_weaver_data_${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url); // 导出 JSON 时清理 blob
              showToast("数据已导出");
            }}>
              <Download size={16} className="mr-2"/> 导出 JSON
            </Button>
            <label htmlFor="file-upload" className="flex items-center justify-center rounded-lg font-medium transition-colors active:scale-95 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-4 py-2 text-sm cursor-pointer">
              <Upload size={16} className="mr-2"/> 导入 JSON
              <input
                id="file-upload"
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const data = JSON.parse(event.target.result);
                      if (data.scenes && data.layers && data.plays && data.commands) {
                        // [修复] 强制生成新的不重复ID，避免ID冲突
                        let worldviewName = "";
                        
                        // 提取世界观名称
                        if (data.scenes && data.scenes.length > 0) {
                          worldviewName = data.scenes[0].worldview || data.scenes[0].name || "导入数据集";
                        } else if (data.layers && data.layers.length > 0) {
                          worldviewName = data.layers[0].worldview || data.layers[0].layer_name || "导入数据集";
                        } else {
                          worldviewName = "导入数据集";
                        }
                        
                        // 获取当前所有ID
                        const existingSceneIds = scenes.map(s => s.id);
                        const existingLayerIds = layers.map(l => l.layer_id);
                        const existingPlayIds = plays.map(p => p.id);
                        const existingCommandIds = commands.map(c => c.id);
                        
                        // 获取世界观前缀
                        const worldviewPrefix = chineseToFirstLetters(worldviewName).substring(0, 3);
                        
                        // 为每个数据项强制生成新的唯一ID
                        const newScenes = data.scenes.map((scene, index) => ({
                          ...scene,
                          id: generateSequentialId('S', existingSceneIds, worldviewPrefix, 'scene', worldviewName),
                          worldview: worldviewName
                        }));
                        
                        const newLayers = data.layers.map((layer, index) => ({
                          ...layer,
                          layer_id: generateSequentialId('L', existingLayerIds, worldviewPrefix, 'layer', worldviewName),
                          worldview: worldviewName
                        }));
                        
                        // 创建新旧ID映射表用于更新外键关联
                        const layerIdMapping = {};
                        data.layers.forEach((oldLayer, index) => {
                          const newLayer = newLayers[index];
                          layerIdMapping[oldLayer.layer_id] = newLayer.layer_id;
                        });
                        
                        const newPlays = data.plays.map((play, index) => ({
                          ...play,
                          id: generateSequentialId('P', existingPlayIds, worldviewPrefix, 'play', worldviewName),
                          fk_layer_id: layerIdMapping[play.fk_layer_id] || play.fk_layer_id,
                          worldview: worldviewName
                        }));
                        
                        // 创建场景ID映射表
                        const sceneIdMapping = {};
                        data.scenes.forEach((oldScene, index) => {
                          const newScene = newScenes[index];
                          sceneIdMapping[oldScene.id] = newScene.id;
                        });
                        
                        const newCommands = data.commands.map((command, index) => ({
                          ...command,
                          id: generateSequentialId('C', existingCommandIds, worldviewPrefix, 'command', worldviewName),
                          fk_target_id: command.fk_target_id ? 
                            command.fk_target_id.split(',').map(id => {
                              if (command.scope_type === 'SCENE') {
                                return sceneIdMapping[id.trim()] || id.trim();
                              } else if (command.scope_type === 'LAYER') {
                                return layerIdMapping[id.trim()] || id.trim();
                              }
                              return id.trim();
                            }).join(',') : command.fk_target_id,
                          worldview: worldviewName
                        }));
                        
                        // 添加新数据（使用强制生成的唯一ID）
                        setScenes(prev => [...prev, ...newScenes]);
                        setLayers(prev => [...prev, ...newLayers]);
                        setPlays(prev => [...prev, ...newPlays]);
                        setCommands(prev => [...prev, ...newCommands]);
                        
                        const totalItems = newScenes.length + newLayers.length + newPlays.length + newCommands.length;
                        showToast(`JSON导入成功（已强制生成唯一ID）：${totalItems}个数据项，世界观：${worldviewName}`);
                        setGeneratedHistory([]); // 清空历史记录以保持数据一致性
                      } else {
                        showToast("JSON 文件格式不正确", "error");
                      }
                    } catch (error) {
                      showToast("文件解析失败: 无效的 JSON", "error");
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
          </div>
          
          {/* 自定义JSON导入（支持assets/自己制作.json格式） */}
          <div className="pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-2">特殊格式导入（支持多数据集）：</p>
            <label htmlFor="custom-json-upload" className="flex items-center justify-center rounded-lg font-medium transition-colors active:scale-95 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-4 py-2 text-sm cursor-pointer w-full">
              <Upload size={16} className="mr-2"/> 导入自定义JSON (如自己制作.json)
              <input
                id="custom-json-upload"
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportCustomJson}
              />
            </label>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-slate-800 flex items-center"><Trash2 size={18} className="mr-2 text-red-600"/> 数据管理</h3>
        <p className="text-sm text-slate-500 mt-2">
          管理本地存储数据，包括手动保存和清理功能。
        </p>
        
        <div className="space-y-3 mt-4">
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => {
              if (saveAllData()) {
                showToast("手动保存成功", "success");
              } else {
                showToast("手动保存失败", "error");
              }
            }}
            disabled={isSaving}
          >
            <Save size={16} className="mr-2" />
            {isSaving ? "保存中..." : "立即保存数据"}
          </Button>
          
          {/* 日志查看器按钮 */}
          <Button
            variant="secondary"
            size="md"
            className="w-full mb-3"
            onClick={() => {
              logUserAction('打开日志查看器', { source: 'settings_page' });
              setShowLogViewer(true);
            }}
          >
            <Bug size={16} className="mr-2" />
            查看应用日志
          </Button>

          <Button
            variant="lightDanger"
            size="md"
            className="w-full"
            onClick={() => {
              if (typeof window !== 'undefined' && window.confirm && window.confirm("确定要清空所有本地数据吗？此操作不可撤销，包括场景、层级、玩法、指令、历史记录等所有数据。")) {
                clearAllData();
                setScenes(INITIAL_SCENES);
                setLayers(INITIAL_LAYERS);
                setPlays(INITIAL_PLAYS);
                setCommands(INITIAL_COMMANDS);
                setGeneratedHistory([]);
                setSelectedSceneId("");
                setSelectedWorldview("");
                setEnableWorldviewFilter(false);
                setActiveTab("generator");
                setGeneratedStory([]);
                showToast("所有数据已清空", "success");
              }
            }}
          >
            <Trash2 size={16} className="mr-2" />
            清空所有数据
          </Button>
        </div>
      </Card>
    </div>
  );


  // --- 主渲染逻辑 ---
  const modalProps = modalOpen ? renderModalContent() : { title: "", content: null };

  return (
    <div className="min-h-screen bg-slate-50 antialiased font-inter">
      {/* V1.3.19 修复：确保 renderConfirmModal 渲染在最前面 */}
      {renderConfirmModal()}

      <main className="max-w-xl mx-auto p-4 pb-20">
        <h1 className="text-2xl font-black text-slate-900 mb-6 flex items-center">
          <FileText size={28} className="mr-2 text-indigo-600"/>
          剧情织造机 V1.3.20
        </h1>

        {/* 内容区域 - 修复Tab命名不一致问题 */}
        <div className="mt-4">
          {activeTab === 'generator' && renderGenerator()}
          {activeTab === 'scenes' && renderSceneList()}
          {activeTab === 'layers' && renderLayerList()}
          {activeTab === 'plays' && renderPlayList()}
          {activeTab === 'commands' && renderCommandList()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      {/* --- Bottom Navigation --- */}
      <nav className="fixed bottom-0 w-full max-w-xl left-1/2 -translate-x-1/2 bg-white border-t flex justify-around items-center h-20 px-2 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40 pointer-events-auto">
        {[
          { id: 'generator', icon: Play, label: '生成' },
          { id: 'scenes', icon: MapPin, label: '场景' }, 
          { id: 'layers', icon: Layers, label: '层级' },
          { id: 'plays', icon: BookOpen, label: '玩法' },
          { id: 'commands', icon: Zap, label: '指令' },
          { id: 'settings', icon: Settings, label: '设置' },
        ].map(item => {
          const handleTabClick = () => {
            if (interactiveMode && item.id !== 'generator') {
              // 使用原生 confirm 时确保在浏览器环境
              if (typeof window !== 'undefined' && window.confirm && window.confirm("剧情走向进行中，切换Tab将丢失当前进度。确定要继续吗？")) {
                setInteractiveMode(false);
                setCurrentLayerIndex(0);
                setInteractiveStory([]);
                setSelectedChoices([]);
                setSelectedCommands([]);
                setCurrentScene(null);
                setCandidatePlays([]);
                setCandidateCommands([]);
                setIsFirstLoad(true);
                setActiveTab(item.id);
              }
            } else {
              setActiveTab(item.id);
            }
          };

          return (
            <NavButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={handleTabClick}
              primary={item.id === 'generator'}
            />
          );
        })}
      </nav>

      {/* 新增/编辑/批量/历史 模态框 (默认 zIndex=50) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
            setModalOpen(false);
            // 确保关闭模态框时清空批量文本和历史编辑状态
            setBatchText(""); 
            setBatchWorldview("");
            setEditingHistoryId(null);
            setTempHistoryTitle('');
        }}
        title={modalProps.title}
      >
        {modalProps.content}
      </Modal>

      {/* 提示条 */}
      <Snackbar message={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "success" })} />

      {/* 日志查看器模态框 */}
      {showLogViewer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] p-4">
          <div className="bg-white rounded-2xl w-full h-full max-w-7xl max-h-[95vh] mx-auto shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Bug className="mr-2" />
                应用日志查看器
              </h3>
              <button 
                onClick={() => setShowLogViewer(false)} 
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <LogViewer />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}