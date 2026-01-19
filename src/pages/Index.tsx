import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Shield,
  Workflow,
  GripVertical,
  FileText,
  CheckCircle2,
  ArrowRight,
  Zap,
  Lock,
  Activity,
  Settings,
  ChevronRight,
  Play,
  Layers,
  UserCog,
  ClipboardList,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import dark theme screenshots
import dashboardDark from "@/assets/screenshots/dashboard.png";
import boardDark from "@/assets/screenshots/board.png";
import adminDark from "@/assets/screenshots/admin.png";
import projectsDark from "@/assets/screenshots/projects.png";

// Import light theme screenshots
import dashboardLight from "@/assets/screenshots/dashboard-light.png";
import boardLight from "@/assets/screenshots/board-light.png";
import adminLight from "@/assets/screenshots/admin-light.png";
import projectsLight from "@/assets/screenshots/projects-light.png";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Loading screen component
const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center"
        >
          <LayoutDashboard className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-2xl font-bold">ProjectFlow</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <div className="min-h-screen bg-background text-foreground overflow-x-hidden scroll-smooth">
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: loading ? 0 : 1, y: loading ? -20 : 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">ProjectFlow</span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <button onClick={() => scrollToSection("features")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</button>
                <button onClick={() => scrollToSection("screenshots")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Screenshots</button>
                <button onClick={() => scrollToSection("demo")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Demo</button>
                <button onClick={() => scrollToSection("technical")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Technical</button>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-9 w-9"
                >
                  {isDark ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/login")}>
                  Open Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background gradients */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: loading ? 0 : 1, y: loading ? 30 : 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge variant="secondary" className="mb-6 px-4 py-1.5">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Production-Grade Demo
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text">
                Manage projects with
                <span className="text-primary"> power</span>
                <br />without the complexity.
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                A full-featured project management system with role-based access, 
                real-time workflows, and enterprise-grade architecture. 
                Built for teams that ship.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate("/login")}>
                  <Play className="mr-2 h-5 w-5" />
                  Open Live Demo
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8 text-base" onClick={() => scrollToSection("features")}>
                  View Features
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            {/* Hero Screenshot */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: loading ? 0 : 1, y: loading ? 50 : 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-16 relative"
            >
              <div className="relative mx-auto max-w-5xl">
                <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="px-4 py-1 rounded-md bg-background text-xs text-muted-foreground">
                        projectflow.app/dashboard
                      </div>
                    </div>
                  </div>
                  <img
                    src={isDark ? dashboardDark : dashboardLight}
                    alt="ProjectFlow Dashboard"
                    className="w-full h-auto"
                  />
                </div>
                
                {/* Floating elements */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: loading ? 0 : 1, x: loading ? -30 : 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute -left-4 top-1/3 hidden lg:block"
                >
                  <div className="p-3 rounded-lg border border-border bg-card shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-xs font-medium">Team assigned</div>
                        <div className="text-xs text-muted-foreground">3 members</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: loading ? 0 : 1, x: loading ? 30 : 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute -right-4 top-1/2 hidden lg:block"
                >
                  <div className="p-3 rounded-lg border border-border bg-card shadow-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">Task completed</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-border bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Built like a real enterprise tool
              </p>
            </motion.div>
            
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                { icon: Shield, label: "Role-Based Access", desc: "Admin & User roles" },
                { icon: Workflow, label: "Advanced Workflows", desc: "Kanban + Drag & Drop" },
                { icon: Activity, label: "Real-Time Updates", desc: "Instant sync" },
                { icon: FileText, label: "Audit Logs", desc: "Full activity tracking" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeInUp}
                  className="text-center p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Screenshots Section */}
        <section id="screenshots" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge variant="outline" className="mb-4">Screenshots</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                See ProjectFlow in action
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A polished, production-ready interface designed for real teams.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                { imgDark: boardDark, imgLight: boardLight, title: "Kanban Board", desc: "Drag-and-drop task management with status columns" },
                { imgDark: projectsDark, imgLight: projectsLight, title: "Projects Overview", desc: "All your projects at a glance with team members" },
                { imgDark: adminDark, imgLight: adminLight, title: "Admin Panel", desc: "Role management and system-level controls" },
                { imgDark: dashboardDark, imgLight: dashboardLight, title: "Dashboard", desc: "Activity feed and task overview" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                  <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/50">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      </div>
                    </div>
                    <img
                      src={isDark ? item.imgDark : item.imgLight}
                      alt={item.title}
                      className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge variant="outline" className="mb-4">Features</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything Jira does — structured, predictable, and scalable.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A complete project management toolkit with the features your team actually needs.
              </p>
            </motion.div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Large feature */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="md:col-span-2 p-8 rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <GripVertical className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Drag & Drop Kanban Board</h3>
                    <p className="text-muted-foreground mb-4">
                      Intuitive task management with smooth drag-and-drop. Move tasks between columns, 
                      reorder priorities, and visualize your workflow at a glance.
                    </p>
                    <ul className="space-y-2">
                      {["Multi-column workflows", "Priority sorting", "Quick task editing"].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-64">
                    <div className="space-y-2">
                      {["Design Review", "API Integration", "Bug Fix"].map((task, i) => (
                        <motion.div
                          key={task}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          viewport={{ once: true }}
                          className="p-3 rounded-lg border border-border bg-background shadow-sm"
                        >
                          <span className="text-sm font-medium">{task}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Regular features */}
              {[
                {
                  icon: Shield,
                  title: "Role-Based Permissions",
                  desc: "Control who can view, edit, or manage projects with granular role-based access control.",
                },
                {
                  icon: UserCog,
                  title: "Admin Controls",
                  desc: "Full administrative panel for user management, role assignment, and system configuration.",
                },
                {
                  icon: FileText,
                  title: "Audit Logs",
                  desc: "Track every action with comprehensive audit logs. Know who did what, and when.",
                },
                {
                  icon: ClipboardList,
                  title: "Task Workflows",
                  desc: "Define custom statuses, priorities, and task types that match your team's process.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Walkthrough Section */}
        <section id="demo" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge variant="outline" className="mb-4">Demo Walkthrough</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                See it in action
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience the full power of the application with our interactive demo. 
                No signup required.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                {[
                  {
                    step: "01",
                    title: "Login as Admin or User",
                    desc: "Choose your role and explore different permission levels.",
                  },
                  {
                    step: "02",
                    title: "Create & Assign Tasks",
                    desc: "Add tasks with priorities, descriptions, and assignees.",
                  },
                  {
                    step: "03",
                    title: "Drag & Drop Workflows",
                    desc: "Move tasks across columns to update their status.",
                  },
                  {
                    step: "04",
                    title: "Manage Users & Roles",
                    desc: "Admin users can manage team members and permissions.",
                  },
                ].map((step, i) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                      <p className="text-muted-foreground">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="p-8 rounded-2xl border border-border bg-card shadow-xl">
                  <h3 className="text-xl font-bold mb-6 text-center">Choose Your Demo Account</h3>
                  <div className="space-y-4">
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full p-4 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div>
                            <div className="font-semibold">Admin Account</div>
                            <div className="text-sm text-muted-foreground">Full access to all features</div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                    
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Users className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-semibold">User Account</div>
                            <div className="text-sm text-muted-foreground">Standard team member access</div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  </div>
                  
                  <p className="text-center text-sm text-muted-foreground mt-6">
                    No signup required • Demo data provided
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Roles & Permissions Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge variant="outline" className="mb-4">Access Control</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Role-based permissions that make sense
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Clear separation of responsibilities between admins and team members.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl border-2 border-primary bg-primary/5"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Admin</h3>
                    <p className="text-sm text-muted-foreground">Full system access</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    "Create and manage all projects",
                    "Add and remove team members",
                    "Assign roles and permissions",
                    "View audit logs and activity",
                    "Configure system settings",
                    "Delete any task or project",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-8 rounded-2xl border border-border bg-card"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Users className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">User</h3>
                    <p className="text-sm text-muted-foreground">Team member access</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    "View assigned projects",
                    "Create and manage own tasks",
                    "Update task status via drag & drop",
                    "View team member profiles",
                    "Comment and collaborate",
                    "Manage personal settings",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Technical Section */}
        <section id="technical" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge variant="outline" className="mb-4">Technical Details</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Built with production-grade architecture
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                This isn't a tutorial project. It's a fully-functional application 
                demonstrating real-world patterns.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Layers,
                  title: "React + TypeScript",
                  desc: "Type-safe components with modern React patterns including hooks and context.",
                },
                {
                  icon: Settings,
                  title: "State Management",
                  desc: "Zustand for global state, React Query for server state caching.",
                },
                {
                  icon: Lock,
                  title: "Permission Logic",
                  desc: "Real role-based access control with protected routes and UI guards.",
                },
                {
                  icon: Workflow,
                  title: "Real Workflows",
                  desc: "Drag-and-drop powered by dnd-kit with optimistic updates.",
                },
                {
                  icon: Activity,
                  title: "Audit System",
                  desc: "Complete activity tracking with user, action, and timestamp logs.",
                },
                {
                  icon: Zap,
                  title: "Modern Tooling",
                  desc: "Vite, Tailwind CSS, Radix UI, and shadcn/ui components.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
                >
                  <item.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 p-6 rounded-xl border border-border bg-card text-center"
            >
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">For recruiters & hiring managers:</span>{" "}
                This demo showcases real engineering decisions, scalable architecture, and attention to detail.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-12 rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-card to-primary/5"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to explore?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Jump into the demo with pre-configured data. No signup, no credit card, 
                no hassle.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate("/login")}>
                  <Play className="mr-2 h-5 w-5" />
                  Launch Demo
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8 text-base" onClick={() => navigate("/login")}>
                  <Shield className="mr-2 h-5 w-5" />
                  Explore Admin Panel
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                ✓ No signup required &nbsp; ✓ Dummy data included &nbsp; ✓ Safe demo environment
              </p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">ProjectFlow</span>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                A production-grade project management demo showcasing enterprise patterns.
              </p>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => scrollToSection("demo")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Demo
                </button>
                <button 
                  onClick={() => scrollToSection("features")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection("technical")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Technical
                </button>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} ProjectFlow. Built for demonstration purposes.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
