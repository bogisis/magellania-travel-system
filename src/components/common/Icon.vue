<template>
  <component :is="iconComponent" :class="iconClasses" :size="size" v-bind="$attrs" />
</template>

<script setup>
import { computed } from 'vue'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  User,
  Users,
  Settings,
  Download,
  Upload,
  FileText,
  File,
  Image,
  Video,
  Music,
  Star,
  Heart,
  Bookmark,
  Share,
  Copy,
  Link,
  ExternalLink,
  Lock,
  Unlock,
  Key,
  Shield,
  AlertCircle,
  HelpCircle,
  Check,
  Home,
  Menu,
  Grid,
  List,
  MoreHorizontal,
  MoreVertical,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Monitor,
  Smartphone,
  Tablet,
  Printer,
  Wifi,
  WifiOff,
  Battery,
  Volume,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  Headphones,
  Speaker,
  Database,
  Server,
  HardDrive,
  Cpu,
  Mouse,
  Keyboard,
  Crown,
  Trophy,
  Medal,
  Award,
  Gift,
  Package,
  ShoppingCart,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Flag,
  Map,
  Compass,
  Car,
  Bus,
  Train,
  Plane,
  Ship,
  Bike,
  Mountain,
  TreeDeciduous,
  Leaf,
  Apple,
  Coffee,
  Wine,
  Beer,
  Cake,
  Pizza,
  Diamond,
} from 'lucide-vue-next'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: [String, Number],
    default: 24,
  },
  class: {
    type: String,
    default: '',
  },
})

// Карта иконок - только существующие
const iconMap = {
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'alert-triangle': AlertTriangle,
  info: Info,
  'loader-2': Loader2,
  x: X,
  plus: Plus,
  minus: Minus,
  edit: Edit,
  'trash-2': Trash2,
  eye: Eye,
  'eye-off': EyeOff,
  search: Search,
  filter: Filter,
  'sort-asc': SortAsc,
  'sort-desc': SortDesc,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  calendar: Calendar,
  clock: Clock,
  'map-pin': MapPin,
  phone: Phone,
  mail: Mail,
  globe: Globe,
  user: User,
  users: Users,
  settings: Settings,
  download: Download,
  upload: Upload,
  'file-text': FileText,
  file: File,
  image: Image,
  video: Video,
  music: Music,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  share: Share,
  copy: Copy,
  link: Link,
  'external-link': ExternalLink,
  lock: Lock,
  unlock: Unlock,
  key: Key,
  shield: Shield,
  'alert-circle': AlertCircle,
  'help-circle': HelpCircle,
  check: Check,
  home: Home,
  menu: Menu,
  grid: Grid,
  list: List,
  'more-horizontal': MoreHorizontal,
  'more-vertical': MoreVertical,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'refresh-cw': RefreshCw,
  'rotate-ccw': RotateCcw,
  'zoom-in': ZoomIn,
  'zoom-out': ZoomOut,
  monitor: Monitor,
  smartphone: Smartphone,
  tablet: Tablet,
  printer: Printer,
  wifi: Wifi,
  'wifi-off': WifiOff,
  battery: Battery,
  volume: Volume,
  'volume-x': VolumeX,
  mic: Mic,
  'mic-off': MicOff,
  camera: Camera,
  headphones: Headphones,
  speaker: Speaker,
  database: Database,
  server: Server,
  'hard-drive': HardDrive,
  cpu: Cpu,
  mouse: Mouse,
  keyboard: Keyboard,
  crown: Crown,
  trophy: Trophy,
  medal: Medal,
  award: Award,
  gift: Gift,
  package: Package,
  'shopping-cart': ShoppingCart,
  'credit-card': CreditCard,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'bar-chart-3': BarChart3,
  'pie-chart': PieChart,
  activity: Activity,
  target: Target,
  flag: Flag,
  map: Map,
  compass: Compass,
  car: Car,
  bus: Bus,
  train: Train,
  plane: Plane,
  ship: Ship,
  bike: Bike,
  mountain: Mountain,
  tree: TreeDeciduous,
  leaf: Leaf,
  apple: Apple,
  coffee: Coffee,
  wine: Wine,
  beer: Beer,
  cake: Cake,
  pizza: Pizza,
  diamond: Diamond,
}

// Вычисляемое свойство для получения компонента иконки
const iconComponent = computed(() => {
  const icon = iconMap[props.name]
  if (!icon) {
    console.warn(`Icon "${props.name}" not found, using Info as fallback`)
    return Info
  }
  return icon
})

// Вычисляемое свойство для классов иконки
const iconClasses = computed(() => {
  const classes = ['icon']

  // Добавляем анимацию для loader-2
  if (props.name === 'loader-2') {
    classes.push('animate-spin')
  }

  // Добавляем пользовательские классы
  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})
</script>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
