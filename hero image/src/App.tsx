import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  FormEvent,
  MouseEvent,
  ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase, uploadImage } from "./lib/supabase";
import { AuthProvider, useAuth } from "./lib/AuthContext";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 120;
const INITIAL_BATCH = 30;
const BATCH_SIZE = 30;
const FRAME_PATH = "/frames/frame_";
const FRAME_EXT = ".webp";

const PROFILE_FRAME_COUNT = 198;
const PROFILE_FRAME_PATH = "/profile/ezgif-frame-";
const PROFILE_FRAME_EXT = ".jpg";

interface TechItem {
  id: string;
  name: string;
  icon: string;
  category: string;
}

interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  skills: string[];
}

const INITIAL_EXPERIENCES: Experience[] = [
  {
    id: "1",
    role: "AI/ML Engineering Intern",
    company: "TechNova Solutions",
    period: "2024 - PRESENT",
    description:
      "Developing robust RAG pipelines and fine-tuning Open-Source LLMs (Llama 3, Mistral) for enterprise-grade customer support automation.",
    skills: ["LangChain", "VectorDB", "Llama 3"],
  },
  {
    id: "2",
    role: "Machine Learning Researcher",
    company: "University AI Lab",
    period: "2023 - 2024",
    description:
      "Conducted research on vision-language models for autonomous medical imaging analysis, achieving 15% improvement in diagnostic accuracy.",
    skills: ["PyTorch", "Computer Vision", "VLM"],
  },
  {
    id: "3",
    role: "Junior Data Scientist",
    company: "FutureSoft AI",
    period: "2022 - 2023",
    description:
      "Engineered predictive models for retail inventory optimization and performed deep EDA to uncover market trends for B2B clients.",
    skills: ["Scikit-learn", "Pandas", "SQL"],
  },
];

export interface Certification {
  id: string;
  title: string;
  organization: string;
  date: string;
  credentialId: string;
  skills: string[];
  image: string;
  url?: string;
  category: "AI/ML" | "Web Development" | "Cybersecurity" | "Cloud" | "Programming" | string;
  featured?: boolean;
}

const INITIAL_CERTIFICATIONS: Certification[] = [
  {
    id: "1",
    title: "AWS Certified Machine Learning – Specialty",
    organization: "Amazon Web Services",
    date: "2024",
    credentialId: "AWS-ML-12345",
    skills: ["SageMaker", "Deep Learning", "Data Engineering"],
    image: "/ai_tools/aws-color.webp",
    url: "#",
    category: "Cloud",
  },
  {
    id: "2",
    title: "DeepLearning.AI TensorFlow Developer",
    organization: "Coursera",
    date: "2023",
    credentialId: "DL-TF-98765",
    skills: ["TensorFlow", "Computer Vision", "NLP"],
    image: "/tech_stack/tensorflow.png",
    url: "#",
    category: "AI/ML",
  },
  {
    id: "3",
    title: "Full Stack Open",
    organization: "University of Helsinki",
    date: "2023",
    credentialId: "FSO-2023",
    skills: ["React", "Node.js", "GraphQL"],
    image: "/tech_stack/javascript.png",
    url: "#",
    category: "Web Development",
  },
];

export interface LearningItem {
  id: string;
  title: string;
  type: "course" | "progress" | "goal";
  status: "completed" | "current" | "upcoming";
  technologies: string[];
  progressPercentage?: number;
}

const INITIAL_LEARNING_ITEMS: LearningItem[] = [
  {
    id: "1",
    title: "Advanced NLP with Hugging Face",
    type: "course",
    status: "completed",
    technologies: ["Transformers", "PyTorch"],
    progressPercentage: 100,
  },
  {
    id: "2",
    title: "Building Agentic Workflows with LangGraph",
    type: "progress",
    status: "current",
    technologies: ["LangChain", "LLMs"],
    progressPercentage: 65,
  },
  {
    id: "3",
    title: "Kubernetes & Cloud Native Architecture",
    type: "goal",
    status: "upcoming",
    technologies: ["Docker", "Kubernetes", "AWS"],
    progressPercentage: 0,
  },
];

interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  image: string;
  techStack: string[];
  hostedLink: string;
  sourceLink: string;
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Agentic Drone Surveillance",
    category: "AI / COMPUTER VISION",
    year: "2024",
    description:
      "An agentic AI—powered drone surveillance system that uses real-time object detection with YOLOv8 and Vision Language Models for intelligent monitoring.",
    image: "/ai_tools/groq_logo.webp",
    techStack: ["LangChain", "YOLOv8", "Django", "React", "Groq", "VLM"],
    hostedLink: "#",
    sourceLink: "#",
  },
  {
    id: "2",
    title: "OpenClaw",
    category: "AGENTIC AI",
    year: "2024",
    description:
      "An agentic AI system integrated with WhatsApp, featuring persistent memory and real-time contextual reasoning powered by advanced LLMs.",
    image: "/ai_tools/antigravity.webp",
    techStack: ["Antigravity", "WhatsApp", "Agentic AI", "LLM"],
    hostedLink: "#",
    sourceLink: "#",
  },
  {
    id: "3",
    title: "EcoVision AI",
    category: "SUSTAINABILITY",
    year: "2024",
    description:
      "AI-powered waste classification and recycling assistant using real-time camera feed to identify and sort recyclables.",
    image: "/ai_tools/ollama-icon.webp",
    techStack: ["PyTorch", "OpenCV", "FastAPI"],
    hostedLink: "#",
    sourceLink: "#",
  },
  {
    id: "4",
    title: "Neural Synth",
    category: "AUDIO AI",
    year: "2024",
    description:
      "Generative music system that creates ambient soundscapes based on user emotional input via webcam analysis.",
    image: "/ai_tools/spline_logo.webp",
    techStack: ["Python", "Librosa", "TensorFlow"],
    hostedLink: "#",
    sourceLink: "#",
  },
  {
    id: "5",
    title: "Sentiment Sphere",
    category: "NLP",
    year: "2024",
    description:
      "Real-time social media sentiment analysis dashboard with interactive 3D visualization of global mood trends.",
    image: "/ai_tools/cloudflare-color.webp",
    techStack: ["React", "Transformers", "D3.js"],
    hostedLink: "#",
    sourceLink: "#",
  },
  {
    id: "6",
    title: "AeroDrone AI",
    category: "ROBOTICS",
    year: "2023",
    description:
      "Autonomous drone navigation system using deep reinforcement learning for complex obstacle avoidance in urban environments.",
    image: "/ai_tools/azure-color.webp",
    techStack: ["C++", "PyTorch", "ROS"],
    hostedLink: "#",
    sourceLink: "#",
  },
  {
    id: "7",
    title: "Quantum Ledger",
    category: "FINTECH",
    year: "2023",
    description:
      "AI-enhanced blockchain explorer that predicts market volatility and detects fraudulent transaction patterns in real-time.",
    image: "/ai_tools/aws-color.webp",
    techStack: ["Go", "Node.js", "Scikit-learn"],
    hostedLink: "#",
    sourceLink: "#",
  },
  {
    id: "8",
    title: "BioSynth Pro",
    category: "BIO-TECH",
    year: "2023",
    description:
      "Deep learning platform for protein folding prediction, helping researchers visualize complex molecular structures with high accuracy.",
    image: "/ai_tools/pngwing.com.png",
    techStack: ["Python", "AlphaFold", "WebGL"],
    hostedLink: "#",
    sourceLink: "#",
  },
  {
    id: "9",
    title: "Solaris Optimizer",
    category: "GREEN TECH",
    year: "2024",
    description:
      "AI for smart grid management, optimizing renewable energy distribution based on real-time weather and consumption patterns.",
    image:
      "https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?q=80&w=2000&auto=format&fit=crop",
    techStack: ["Python", "LSTM", "InfluxDB"],
    hostedLink: "#",
    sourceLink: "#",
  },
  {
    id: "10",
    title: "Visionary AR",
    category: "AR / VR",
    year: "2024",
    description:
      "Augmented reality interior design tool using spatial mapping and AI-driven furniture placement for immersive home planning.",
    image:
      "https://images.unsplash.com/photo-1633177317976-3f9bc45e1d1d?q=80&w=2000&auto=format&fit=crop",
    techStack: ["Unity", "ARKit", "TensorFlow Lite"],
    hostedLink: "#",
    sourceLink: "#",
  },
  {
    id: "11",
    title: "Nexus Guard",
    category: "CYBERSECURITY",
    year: "2023",
    description:
      "Threat detection platform using behavioral AI to identify zero-day vulnerabilities and autonomous network defense responses.",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop",
    techStack: ["Rust", "Scikit-learn", "Kafka"],
    hostedLink: "#",
    sourceLink: "#",
  },
  {
    id: "12",
    title: "Deep Voice AI",
    category: "AUDIO AI",
    year: "2023",
    description:
      "Real-time voice cloning and translation system that preserves emotional nuance and speaker characteristics across languages.",
    image:
      "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=2000&auto=format&fit=crop",
    techStack: ["Python", "PyTorch", "FastAPI"],
    hostedLink: "#",
    sourceLink: "#",
  },
];

const INITIAL_TECHS: TechItem[] = [
  {
    id: "1",
    name: "Azure",
    icon: "/ai_tools/azure-color.webp",
    category: "CLOUD",
  },
  {
    id: "2",
    name: "Django",
    icon: "/tech_stack/django.png",
    category: "BACKEND",
  },
  {
    id: "3",
    name: "Flask",
    icon: "/tech_stack/flask.png",
    category: "BACKEND",
  },
  { id: "4", name: "GitHub", icon: "/ai_tools/github.webp", category: "TOOLS" },
  {
    id: "5",
    name: "JavaScript",
    icon: "/tech_stack/javascript.png",
    category: "FRONTEND",
  },
  {
    id: "6",
    name: "LangGraph",
    icon: "/tech_stack/langgraph.webp",
    category: "AI CORE",
  },
  {
    id: "7",
    name: "Node.js",
    icon: "/tech_stack/node-js.png",
    category: "BACKEND",
  },
  {
    id: "8",
    name: "PostgreSQL",
    icon: "/tech_stack/postgresql.png",
    category: "DATABASE",
  },
  {
    id: "9",
    name: "Python",
    icon: "/tech_stack/python.png",
    category: "LANGUAGE",
  },
  {
    id: "10",
    name: "Tailwind CSS",
    icon: "/tech_stack/tailwind-css.png",
    category: "STYLING",
  },
  {
    id: "11",
    name: "TensorFlow",
    icon: "/tech_stack/tensorflow.png",
    category: "AI CORE",
  },
  {
    id: "12",
    name: "AWS",
    icon: "/ai_tools/aws-color.webp",
    category: "CLOUD",
  },
  {
    id: "13",
    name: "Groq",
    icon: "/ai_tools/groq_logo.webp",
    category: "AI CORE",
  },
  {
    id: "14",
    name: "Ollama",
    icon: "/ai_tools/ollama-icon.webp",
    category: "AI CORE",
  },
  {
    id: "15",
    name: "Antigravity",
    icon: "/ai_tools/antigravity.webp",
    category: "AI CORE",
  },
  {
    id: "16",
    name: "Cloudflare",
    icon: "/ai_tools/cloudflare-color.webp",
    category: "INFRA",
  },
  {
    id: "17",
    name: "Spline",
    icon: "/ai_tools/spline_logo.webp",
    category: "DESIGN",
  },
];

function useTechStack() {
  const [techs, setTechs] = useState<TechItem[]>([]);
  const channelId = useRef(`skills-realtime-${crypto.randomUUID()}`);

  const fetchTechs = async () => {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("name", { ascending: true });
    if (!error && data) {
      setTechs(data as TechItem[]);
    }
  };

  useEffect(() => {
    fetchTechs();

    const channel = supabase
      .channel(channelId.current)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "skills" },
        () => {
          fetchTechs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addTech = async (tech: Omit<TechItem, "id">) => {
    await supabase.from("skills").insert([tech]);
  };

  const updateTech = async (id: string, updatedTech: Partial<TechItem>) => {
    await supabase.from("skills").update(updatedTech).eq("id", id);
  };

  const deleteTech = async (id: string) => {
    await supabase.from("skills").delete().eq("id", id);
  };

  const resetTechs = async () => {
    await supabase.from("skills").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const toInsert = INITIAL_TECHS.map(({ id, ...rest }) => rest);
    await supabase.from("skills").insert(toInsert);
  };

  return { techs, addTech, updateTech, deleteTech, resetTechs };
}

const mapProjectFromDB = (p: any): Project => ({
  id: p.id,
  title: p.title,
  category: p.category || "",
  year: p.year || "",
  description: p.description || "",
  image: p.image || "",
  techStack: p.tech_stack || [],
  hostedLink: p.live || "",
  sourceLink: p.github || "",
});

const mapProjectToDB = (p: any) => ({
  title: p.title,
  category: p.category,
  year: p.year,
  description: p.description,
  image: p.image,
  tech_stack: p.techStack,
  live: p.hostedLink,
  github: p.sourceLink,
});

function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const channelId = useRef(`projects-realtime-${crypto.randomUUID()}`);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setProjects(data.map(mapProjectFromDB));
    }
  };

  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel(channelId.current)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProject = async (project: Omit<Project, "id">) => {
    const dbProj = mapProjectToDB(project);
    const { error } = await supabase.from("projects").insert([dbProj]);
    if (error) { console.error("addProject:", error); alert(`Save failed: ${error.message}`); }
  };

  const updateProject = async (updated: Project) => {
    const dbProj = mapProjectToDB(updated);
    const { error } = await supabase.from("projects").update(dbProj).eq("id", updated.id);
    if (error) { console.error("updateProject:", error); alert(`Update failed: ${error.message}`); }
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) { console.error("deleteProject:", error); alert(`Delete failed: ${error.message}`); }
  };

  const resetProjects = async () => {
    await supabase.from("projects").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const toInsert = INITIAL_PROJECTS.map(p => mapProjectToDB(p));
    await supabase.from("projects").insert(toInsert);
  };

  return { projects, addProject, updateProject, deleteProject, resetProjects };
}

function useExperience() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const channelId = useRef(`experiences-realtime-${crypto.randomUUID()}`);

  const fetchExperiences = async () => {
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setExperiences(data as Experience[]);
    }
  };

  useEffect(() => {
    fetchExperiences();

    const channel = supabase
      .channel(channelId.current)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "experiences" },
        () => {
          fetchExperiences();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addExperience = async (experience: Omit<Experience, "id">) => {
    const { error } = await supabase.from("experiences").insert([experience]);
    if (error) { console.error("addExperience:", error); alert(`Save failed: ${error.message}`); }
  };

  const updateExperience = async (updated: Experience) => {
    const { id, ...rest } = updated;
    const { error } = await supabase.from("experiences").update(rest).eq("id", id);
    if (error) { console.error("updateExperience:", error); alert(`Update failed: ${error.message}`); }
  };

  const deleteExperience = async (id: string) => {
    const { error } = await supabase.from("experiences").delete().eq("id", id);
    if (error) { console.error("deleteExperience:", error); alert(`Delete failed: ${error.message}`); }
  };

  const resetExperiences = async () => {
    await supabase.from("experiences").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const toInsert = INITIAL_EXPERIENCES.map(({ id, ...rest }) => rest);
    await supabase.from("experiences").insert(toInsert);
  };

  return { experiences, addExperience, updateExperience, deleteExperience, resetExperiences };
}

const mapCertFromDB = (c: any): Certification => ({
  id: c.id,
  title: c.title,
  organization: c.issuer || c.organization || "",
  date: c.date || "",
  credentialId: c.credential_id || "",
  skills: c.skills || [],
  image: c.image || "",
  url: c.link || c.url || "",
  category: c.category || "",
  featured: c.featured ?? false,
});

const mapCertToDB = (c: any) => ({
  title: c.title,
  issuer: c.organization,
  organization: c.organization,
  date: c.date,
  credential_id: c.credentialId,
  skills: c.skills,
  image: c.image,
  link: c.url,
  url: c.url,
  category: c.category,
  featured: c.featured ?? false,
});

function useCertifications() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const channelId = useRef(`certifications-realtime-${crypto.randomUUID()}`);

  const fetchCertifications = async () => {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setCertifications(data.map(mapCertFromDB));
    }
  };

  useEffect(() => {
    fetchCertifications();

    const channel = supabase
      .channel(channelId.current)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "certifications" },
        () => {
          fetchCertifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addCertification = async (cert: Omit<Certification, "id">) => {
    const dbCert = mapCertToDB(cert);
    const { error } = await supabase.from("certifications").insert([dbCert]);
    if (error) { console.error("addCertification:", error); alert(`Save failed: ${error.message}`); }
  };

  const updateCertification = async (updated: Certification) => {
    const dbCert = mapCertToDB(updated);
    const { error } = await supabase.from("certifications").update(dbCert).eq("id", updated.id);
    if (error) { console.error("updateCertification:", error); alert(`Update failed: ${error.message}`); }
  };

  const deleteCertification = async (id: string) => {
    const { error } = await supabase.from("certifications").delete().eq("id", id);
    if (error) { console.error("deleteCertification:", error); alert(`Delete failed: ${error.message}`); }
  };

  const resetCertifications = async () => {
    await supabase.from("certifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const toInsert = INITIAL_CERTIFICATIONS.map(c => mapCertToDB(c));
    await supabase.from("certifications").insert(toInsert);
  };

  return { certifications, addCertification, updateCertification, deleteCertification, resetCertifications };
}

const mapLearningFromDB = (i: any): LearningItem => ({
  id: i.id,
  title: i.title,
  type: i.type,
  status: i.status,
  technologies: i.technologies || [],
  progressPercentage: i.progress_percentage || 0,
});

const mapLearningToDB = (i: any) => ({
  title: i.title,
  type: i.type,
  status: i.status,
  technologies: i.technologies,
  progress_percentage: i.progressPercentage || 0,
});

function useLearningItems() {
  const [learningItems, setLearningItems] = useState<LearningItem[]>([]);
  const channelId = useRef(`learning-items-realtime-${crypto.randomUUID()}`);

  const fetchLearningItems = async () => {
    const { data, error } = await supabase
      .from("learning_items")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setLearningItems(data.map(mapLearningFromDB));
    }
  };

  useEffect(() => {
    fetchLearningItems();

    const channel = supabase
      .channel(channelId.current)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "learning_items" },
        () => {
          fetchLearningItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addLearningItem = async (item: Omit<LearningItem, "id">) => {
    const dbItem = mapLearningToDB(item);
    const { error } = await supabase.from("learning_items").insert([dbItem]);
    if (error) { console.error("addLearningItem:", error); alert(`Save failed: ${error.message}`); }
  };

  const updateLearningItem = async (updated: LearningItem) => {
    const dbItem = mapLearningToDB(updated);
    const { error } = await supabase.from("learning_items").update(dbItem).eq("id", updated.id);
    if (error) { console.error("updateLearningItem:", error); alert(`Update failed: ${error.message}`); }
  };

  const deleteLearningItem = async (id: string) => {
    const { error } = await supabase.from("learning_items").delete().eq("id", id);
    if (error) { console.error("deleteLearningItem:", error); alert(`Delete failed: ${error.message}`); }
  };

  const resetLearningItems = async () => {
    await supabase.from("learning_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const toInsert = INITIAL_LEARNING_ITEMS.map(i => mapLearningToDB(i));
    await supabase.from("learning_items").insert(toInsert);
  };

  return { learningItems, addLearningItem, updateLearningItem, deleteLearningItem, resetLearningItems };
}

function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleHoverStart = () => setIsHovering(true);
    const handleHoverEnd = () => setIsHovering(false);

    window.addEventListener("mousemove", handleMouseMove as any);

    // Track interactive elements for hover effect
    const updateInteractiveElements = () => {
      const interactiveElements = document.querySelectorAll(
        'a, button, input, textarea, [role="button"], .group, .clickable'
      );
      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", handleHoverStart);
        el.addEventListener("mouseleave", handleHoverEnd);
      });
    };

    updateInteractiveElements();
    
    // Re-run periodically or on navigation if needed
    const interval = setInterval(updateInteractiveElements, 2000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove as any);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <motion.div
        className="custom-cursor-inner"
        animate={{
          x: mousePos.x - 4,
          y: mousePos.y - 4,
          scale: isHovering ? 2 : 1,
          opacity: 1,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 400, mass: 0.2 }}
      />
      <motion.div
        className="custom-cursor-outer"
        animate={{
          x: mousePos.x - 18,
          y: mousePos.y - 18,
          scale: isHovering ? 1.8 : 1,
          borderWidth: isHovering ? "2px" : "1px",
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.6 }}
      />
    </>
  );
}

function SelectedWorks() {
  const { projects } = useProjects();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !scrollContainerRef.current) return;

    const scrollWidth = scrollContainerRef.current.scrollWidth;
    const windowWidth = window.innerWidth;
    const amountToScroll = scrollWidth - windowWidth;

    const ctx = gsap.context(() => {
      gsap.to(scrollContainerRef.current, {
        x: -amountToScroll,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${amountToScroll * 0.5}`,
          pin: true,
          scrub: 0.3,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [projects]);

  const displayProjects = projects.slice(0, 6);

  return (
    <section
      ref={sectionRef}
      className="bg-[#020308] overflow-hidden h-screen flex flex-col justify-center"
    >
      <div className="px-6 md:px-12 mb-8">
        <h2 className="text-[10px] uppercase tracking-[0.8em] text-sky-400 font-black mb-2">
          Project
        </h2>
        <div className="h-px w-24 bg-gradient-to-r from-sky-500 to-transparent" />
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-8 px-6 md:px-12"
          style={{ width: "fit-content" }}
        >
          {displayProjects.map((project) => (
            <div key={project.id} className="w-[300px] md:w-[400px] shrink-0">
              <TiltCard className="glass-card group overflow-hidden rounded-[2rem] border border-white/10 transition-all duration-500 hover:border-sky-500/50">
                <div className="relative h-56 md:h-64 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

                  <div className="absolute top-4 right-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                      {project.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                      {project.title}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      {project.year}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6 line-clamp-2 min-h-[2.5rem]">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.techStack?.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-[9px] font-bold text-slate-300 uppercase tracking-wider px-2 py-1 bg-white/5 rounded-md border border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                    {(project.techStack?.length || 0) > 3 && (
                      <span className="text-[9px] font-bold text-sky-400 px-2 py-1 bg-sky-500/10 rounded-md">
                        +{(project.techStack?.length || 0) - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <a
                      href={project.hostedLink}
                      target="_blank"
                      rel="noreferrer"
                      className="group/link flex items-center gap-2 text-[10px] font-bold text-sky-400 uppercase tracking-[0.2em] transition-all hover:text-white"
                    >
                      <span>Live Site</span>
                      <svg
                        className="w-3 h-3 transition-transform group-hover/link:-rotate-45"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </TiltCard>
            </div>
          ))}

          {/* View All Button Card */}
          <div className="w-[300px] md:w-[400px] shrink-0 flex items-center justify-center pr-24">
            <button
              onClick={() => navigate("/projects")}
              className="group relative flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 rounded-full border border-sky-500/30 flex items-center justify-center transition-all duration-500 group-hover:bg-sky-500 group-hover:scale-110 shadow-lg group-hover:shadow-sky-500/20">
                <svg
                  className="w-8 h-8 text-sky-400 group-hover:text-slate-950 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
              <span className="text-sm font-black text-white uppercase tracking-[0.4em] group-hover:text-sky-400 transition-colors">
                View All Projects
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileAnimatedImage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const requestRef = useRef<number>();
  const [ready, setReady] = useState(false);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas || framesRef.current.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgIndex = Math.min(
      Math.max(Math.round(index), 0),
      PROFILE_FRAME_COUNT - 1,
    );
    const img = framesRef.current[imgIndex];
    if (!img || !img.complete) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const aspect = img.width / img.height;
    const canvasAspect = width / height;

    let drawWidth = width;
    let drawHeight = height;

    if (canvasAspect > aspect) {
      drawHeight = width / aspect;
    } else {
      drawWidth = height * aspect;
    }

    const dx = (width - drawWidth) / 2;
    const dy = (height - drawHeight) / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
    ctx.restore();
  }, []);

  useEffect(() => {
    let mounted = true;
    let loadedCount = 0;
    const frames: HTMLImageElement[] = [];

    for (let i = 1; i <= PROFILE_FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `${PROFILE_FRAME_PATH}${String(i).padStart(3, "0")}${PROFILE_FRAME_EXT}`;
      img.onload = () => {
        if (!mounted) return;
        loadedCount++;
        if (loadedCount >= Math.min(10, PROFILE_FRAME_COUNT)) {
          setReady(true);
        }
      };
      img.onerror = () => {
        if (!mounted) return;
        loadedCount++;
        if (loadedCount >= Math.min(10, PROFILE_FRAME_COUNT)) {
          setReady(true);
        }
      };
      frames.push(img);
    }
    framesRef.current = frames;

    let lastTime = 0;
    const fps = 10;
    const interval = 1000 / fps;
    let currentFrame = 0;

    const loop = (time: number) => {
      if (!mounted) return;
      if (time - lastTime >= interval) {
        currentFrame = (currentFrame + 1) % PROFILE_FRAME_COUNT;
        drawFrame(currentFrame);
        lastTime = time;
      }
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      mounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [drawFrame]);

  // Initial draw and resize
  useEffect(() => {
    if (!ready) return;
    drawFrame(0);
    const handleResize = () => drawFrame(0);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [ready, drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ display: "block" }}
    />
  );
}

function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;
    setRotate({ x: rotateX, y: rotateY });
    setGlow({ x, y, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlow({ ...glow, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${className} relative transition-transform duration-200 ease-out`}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)`,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glow.x}px ${glow.y}px, rgba(56, 189, 248, 0.15), transparent 60%)`,
          opacity: glow.opacity,
        }}
      />
      {children}
    </div>
  );
}

function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <TiltCard className="glass-card rounded-[1.5rem] p-4 flex flex-col justify-between overflow-hidden">
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative group shrink-0">
          <img
            src="/best_of_me/The_Weeknd_-_Starboy.png"
            alt="Starboy"
            className={`w-16 h-16 rounded-xl object-cover shadow-2xl transition-transform duration-500 ${isPlaying ? "scale-110 rotate-3" : "group-hover:scale-105"}`}
          />
          {isPlaying && (
            <div className="absolute -inset-1 bg-sky-500/20 blur-lg rounded-xl animate-pulse" />
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-[10px] uppercase tracking-[0.3em] text-sky-400 font-bold mb-1">
            Best of Me
          </p>
          <h3 className="text-sm font-black text-white truncate">Starboy</h3>
          <p className="text-[10px] text-slate-400 truncate">
            The Weeknd, Daft Punk
          </p>
        </div>
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 hover:bg-sky-500 hover:border-sky-400 group shrink-0"
        >
          {isPlaying ? (
            <div className="flex gap-1.5">
              <div className="w-1.5 h-4 bg-white rounded-full" />
              <div className="w-1.5 h-4 bg-white rounded-full" />
            </div>
          ) : (
            <div className="ml-1 w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent" />
          )}
        </button>
      </div>

      <div className="mt-4 flex items-end justify-between gap-1 h-6">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className={`w-full bg-sky-500/30 rounded-t-sm transition-all duration-500 ${isPlaying ? `animate-music-bar-${(i % 3) + 1}` : "h-1"}`}
            style={{
              animationDelay: `${i * 0.05}s`,
              opacity: 0.3 + (i / 15) * 0.7,
            }}
          />
        ))}
      </div>
      <audio
        ref={audioRef}
        src="/best_of_me/The Weeknd, Daft Punk - Starboy.mp3"
        onEnded={() => setIsPlaying(false)}
      />
    </TiltCard>
  );
}

function TechStackGrid() {
  const { techs } = useTechStack();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!techs.length || !sectionRef.current || !gridRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".tech-card-wrapper");
      const grid = gridRef.current!;
      const header = sectionRef.current?.querySelector(".tech-stack-header");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=350%",
          pin: true,
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });

      // 1. Spread out from stack
      cards.forEach((card, i) => {
        const gridRect = grid.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const centerX = gridRect.width / 2;
        const centerY = gridRect.height / 2;
        const cardCenterX = cardRect.left - gridRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top - gridRect.top + cardRect.height / 2;

        const diffX = centerX - cardCenterX;
        const diffY = centerY - cardCenterY;

        tl.fromTo(
          card,
          {
            x: diffX,
            y: diffY,
            rotation: ((i % 3) - 1) * 10 + Math.sin(i) * 5,
            scale: 0.7,
            opacity: 0,
            zIndex: techs.length - i,
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            zIndex: 1,
            ease: "power2.inOut",
          },
          0,
        );
      });

      // 2. Fade out header and cards once spread is complete
      tl.to(
        [header, ...cards],
        {
          opacity: 0,
          y: (i) => (i === 0 ? -50 : -100), // Move header up slightly less than cards
          scale: (i) => (i === 0 ? 1 : 0.9),
          stagger: 0.05,
          ease: "power2.in",
        },
        "+=0.2",
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [techs]);

  return (
    <section
      ref={sectionRef}
      className="bg-[#020308] py-20 px-4 md:px-12 min-h-screen flex flex-col justify-center overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="tech-stack-header text-center mb-16 md:mb-24">
          <h2 className="text-[10px] uppercase tracking-[0.8em] text-sky-400 font-black mb-2">
            Tech Stack
          </h2>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-8 relative"
        >
          {techs.map((tech, i) => (
            <div key={tech.id} className="tech-card-wrapper">
              <TiltCard className="glass-card rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 flex flex-col items-center justify-center md:justify-between border border-white/5 hover:border-sky-500/50 transition-all duration-500 group cursor-default shadow-2xl h-28 md:h-48 lg:h-56">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] md:rounded-[2.5rem]" />

                <div className="hidden md:block text-[8px] lg:text-[9px] font-black text-sky-400/60 uppercase tracking-[0.25em] mb-4 group-hover:text-sky-400 transition-colors">
                  {tech.category}
                </div>

                <div className="relative w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1 md:group-hover:-translate-y-2">
                  <img
                    src={tech.icon}
                    alt={tech.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                  />
                </div>

                <p className="text-[8px] md:text-[10px] lg:text-xs font-black text-slate-300 uppercase tracking-[0.15em] md:tracking-[0.2em] text-center mt-3 md:mt-6 group-hover:text-white transition-colors truncate w-full">
                  {tech.name}
                </p>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#020308] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Loading Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

function ForgotPasswordLink() {
  const [open, setOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpStatus, setFpStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [fpError, setFpError] = useState("");

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFpStatus("sending");
    setFpError("");

    const { error } = await supabase.auth.resetPasswordForEmail(fpEmail, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (error) {
      setFpError(error.message);
      setFpStatus("error");
    } else {
      setFpStatus("sent");
    }
  };

  return (
    <>
      <div className="text-center">
        <button
          type="button"
          onClick={() => { setOpen(true); setFpStatus("idle"); setFpEmail(""); setFpError(""); }}
          className="text-sm text-sky-400 hover:text-sky-300 transition-colors underline underline-offset-4"
        >
          Forgot password?
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0f1e] p-8 shadow-2xl space-y-6 animate-fade-in">
            {fpStatus === "sent" ? (
              <div className="flex flex-col items-center gap-4 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Check your inbox</h2>
                  <p className="text-slate-400 text-sm">
                    A password reset link has been sent to <span className="text-sky-300 font-medium">{fpEmail}</span>. Follow the link in your email to reset your password.
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-sm font-semibold hover:bg-sky-400 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-white">Reset Password</h2>
                  <p className="text-slate-400 text-sm">
                    Enter your account email and we'll send you a secure reset link.
                  </p>
                </div>
                <form onSubmit={handleReset} className="space-y-4">
                  <label className="block text-sm text-slate-200">
                    Email address
                    <input
                      type="email"
                      required
                      value={fpEmail}
                      onChange={(e) => setFpEmail(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                      placeholder="your@email.com"
                    />
                  </label>
                  {fpStatus === "error" && (
                    <p className="text-sm text-rose-400">{fpError}</p>
                  )}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={fpStatus === "sending"}
                      className="flex-1 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {fpStatus === "sending" ? "Sending..." : "Send Reset Link"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from =
    (location.state as { from?: Location })?.from?.pathname ||
    "/admin/dashboard";

  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    navigate(from, { replace: true });
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#020308] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Loading Auth...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#020308] px-6 py-16 text-slate-100 md:px-12 flex items-center justify-center">
      <div className="mx-auto w-full max-w-xl space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300">
            Admin Access
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Secure Dashboard Login
          </h1>
          <p className="text-slate-400 text-sm">
            Enter your administrator credentials to access the content management system.
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-200">
            Email
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
            />
          </label>
          <label className="block text-sm text-slate-200">
            Password
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
            />
          </label>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button 
            disabled={submitting}
            className="w-full rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>
        <ForgotPasswordLink />
      </div>
    </main>
  );
}

function TechStackManagement() {
  const { techs, addTech, updateTech, deleteTech } = useTechStack();
  const [isAdding, setIsAdding] = useState(false);
  const [newTech, setNewTech] = useState<Omit<TechItem, "id">>({
    name: "",
    icon: "",
    category: "LANGUAGE",
  });

  const categories = [
    "LANGUAGE",
    "AI CORE",
    "FRONTEND",
    "BACKEND",
    "STYLING",
    "DATABASE",
    "TOOLS",
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTech((prev) => ({ ...prev, icon: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (newTech.name && newTech.icon) {
      addTech(newTech);
      setNewTech({ name: "", icon: "", category: "LANGUAGE" });
      setIsAdding(false);
    }
  };

  return (
    <DashboardShell title="Tech Stack Management">
      <div className="space-y-12">
        {/* Add New Section */}
        <div className="glass-card p-8 rounded-[2rem] border border-white/10">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-3 text-sky-400 font-bold uppercase tracking-widest text-sm mb-6"
          >
            <span className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-lg">
              {isAdding ? "−" : "+"}
            </span>
            {isAdding ? "Cancel Adding" : "Add New Technology"}
          </button>

          {isAdding && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                Tech Name
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400"
                  value={newTech.name}
                  onChange={(e) =>
                    setNewTech({ ...newTech, name: e.target.value })
                  }
                  placeholder="e.g. PyTorch"
                />
              </label>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                Category
                <select
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400"
                  value={newTech.category}
                  onChange={(e) =>
                    setNewTech({ ...newTech, category: e.target.value })
                  }
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                Icon (File or URL)
                <div className="mt-2 flex gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="tech-icon-upload"
                  />
                  <label
                    htmlFor="tech-icon-upload"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    Upload Image
                  </label>
                  <input
                    className="flex-[2] rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400"
                    value={
                      newTech.icon.startsWith("data:")
                        ? "Image Uploaded"
                        : newTech.icon
                    }
                    onChange={(e) =>
                      setNewTech({ ...newTech, icon: e.target.value })
                    }
                    placeholder="or https://..."
                  />
                </div>
              </label>
              <div className="md:col-span-3 flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-8 py-3 rounded-2xl bg-sky-500 text-slate-950 font-bold uppercase tracking-widest hover:bg-sky-400 transition-colors"
                >
                  Save Technology
                </button>
              </div>
            </div>
          )}
        </div>

        {/* List Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techs.map((tech) => (
            <div
              key={tech.id}
              className="glass-card p-6 rounded-[2rem] border border-white/10 flex items-center gap-6 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 p-3 flex items-center justify-center group-hover:border-sky-500/30 transition-colors">
                <img
                  src={tech.icon}
                  alt={tech.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-[8px] font-black text-sky-400 uppercase tracking-widest mb-1">
                  {tech.category}
                </p>
                <h3 className="text-white font-bold">{tech.name}</h3>
              </div>
              <button
                onClick={() => {
                  if (window.confirm(`Remove ${tech.name}?`))
                    deleteTech(tech.id);
                }}
                className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/20"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

function AdminProjects() {
  const { projects, deleteProject } = useProjects();
  const navigate = useNavigate();

  return (
    <DashboardShell title="Projects Manager">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="glass-card flex flex-col rounded-3xl p-6 border border-white/10"
          >
            <img
              src={project.image}
              className="h-32 w-full rounded-2xl object-cover mb-4"
            />
            <h3 className="font-bold text-white mb-1">{project.title}</h3>
            <p className="text-xs text-slate-400 mb-6">{project.category}</p>
            <div className="mt-auto flex gap-2">
              <button
                onClick={() => navigate(`/admin/edit-project/${project.id}`)}
                className="flex-1 rounded-xl bg-white/5 py-2 text-xs font-bold transition hover:bg-white/10"
              >
                Edit
              </button>
              <button
                onClick={() => deleteProject(project.id)}
                className="flex-1 rounded-xl bg-rose-500/20 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

function ProjectForm({
  initialData,
  onSubmit,
}: {
  initialData?: Project;
  onSubmit: (data: any) => void;
}) {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    category: initialData?.category || "",
    year: initialData?.year || new Date().getFullYear().toString(),
    description: initialData?.description || "",
    image: initialData?.image || "",
    techStack: initialData?.techStack?.join(", ") || "",
    hostedLink: initialData?.hostedLink || "",
    sourceLink: initialData?.sourceLink || "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const url = await uploadImage(file);
        setFormData((prev) => ({ ...prev, image: url }));
      } catch (err: any) {
        console.error("Image upload failed:", err);
        alert(`Image upload failed: ${err.message || err}`);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      techStack: formData.techStack
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    });
    navigate("/admin/projects");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card rounded-[2rem] p-8 border border-white/10 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
            Title
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400 transition"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </label>
          <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
            Category
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400 transition"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            />
          </label>
          <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
            Year
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400 transition"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              required
            />
          </label>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
            Project Image
            <div className="mt-2 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-slate-900 border border-white/10 overflow-hidden shrink-0">
                {formData.image ? (
                  <img
                    src={formData.image}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-600">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20 cursor-pointer disabled:opacity-50"
              />
              {uploading && <span className="text-xs text-sky-400 animate-pulse">Uploading...</span>}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Or paste a URL below:
            </p>
            <input
              className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-2 text-white outline-none focus:border-sky-400 transition text-sm"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              placeholder="https://..."
            />
          </label>
          <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
            Tech Stack (comma separated)
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400 transition"
              value={formData.techStack}
              onChange={(e) =>
                setFormData({ ...formData, techStack: e.target.value })
              }
              placeholder="React, GSAP, Tailwind..."
            />
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Hosted Link
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400 transition"
            value={formData.hostedLink}
            onChange={(e) =>
              setFormData({ ...formData, hostedLink: e.target.value })
            }
          />
        </label>
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Source Link
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400 transition"
            value={formData.sourceLink}
            onChange={(e) =>
              setFormData({ ...formData, sourceLink: e.target.value })
            }
          />
        </label>
      </div>
      <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
        Description
        <textarea
          className="mt-2 w-full h-24 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400 transition resize-none"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </label>
      <div className="flex justify-end gap-4 pt-2">
        <button
          type="button"
          onClick={() => navigate("/admin/projects")}
          className="px-8 py-3 rounded-2xl bg-white/5 font-bold uppercase tracking-widest transition hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploading}
          className="px-8 py-3 rounded-2xl bg-sky-500 text-slate-950 font-bold uppercase tracking-widest transition hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : initialData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}

function AdminAddProject() {
  const { addProject } = useProjects();
  return (
    <DashboardShell title="Add New Project">
      <ProjectForm onSubmit={addProject} />
    </DashboardShell>
  );
}

function AdminEditProject() {
  const { id } = useParams();
  const { projects, updateProject } = useProjects();
  const project = projects.find((p) => p.id === id);

  if (!project) return null;

  return (
    <DashboardShell title="Edit Project">
      <ProjectForm
        initialData={project}
        onSubmit={(data) => updateProject({ ...data, id })}
      />
    </DashboardShell>
  );
}

function AdminExperience() {
  const { experiences, deleteExperience } = useExperience();
  const navigate = useNavigate();

  return (
    <DashboardShell title="Experience Manager">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="glass-card flex flex-col rounded-3xl p-6 border border-white/10"
          >
            <h3 className="font-bold text-white mb-1">{exp.role}</h3>
            <p className="text-xs text-sky-400 mb-2">{exp.company}</p>
            <p className="text-xs text-slate-400 mb-6">{exp.period}</p>
            <div className="mt-auto flex gap-2">
              <button
                onClick={() => navigate(`/admin/edit-experience/${exp.id}`)}
                className="flex-1 rounded-xl bg-white/5 py-2 text-xs font-bold transition hover:bg-white/10"
              >
                Edit
              </button>
              <button
                onClick={() => deleteExperience(exp.id)}
                className="flex-1 rounded-xl bg-rose-500/20 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

function ExperienceForm({
  initialData,
  onSubmit,
}: {
  initialData?: Experience;
  onSubmit: (data: any) => void;
}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: initialData?.role || "",
    company: initialData?.company || "",
    period: initialData?.period || "",
    description: initialData?.description || "",
    skills: initialData?.skills?.join(", ") || "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      skills: formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    });
    navigate("/admin/experience");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card rounded-[2rem] p-8 border border-white/10 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Role
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400 transition"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          />
        </label>
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Company
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400 transition"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            required
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Period
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400 transition"
            value={formData.period}
            onChange={(e) =>
              setFormData({ ...formData, period: e.target.value })
            }
            placeholder="e.g. 2024 - PRESENT"
            required
          />
        </label>
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Skills (comma separated)
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400 transition"
            value={formData.skills}
            onChange={(e) =>
              setFormData({ ...formData, skills: e.target.value })
            }
            placeholder="React, Next.js, TypeScript..."
            required
          />
        </label>
      </div>
      <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
        Description
        <textarea
          className="mt-2 w-full h-24 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400 transition resize-none"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </label>
      <div className="flex justify-end gap-4 pt-2">
        <button
          type="button"
          onClick={() => navigate("/admin/experience")}
          className="px-8 py-3 rounded-2xl bg-white/5 font-bold uppercase tracking-widest transition hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-8 py-3 rounded-2xl bg-sky-500 text-slate-950 font-bold uppercase tracking-widest transition hover:bg-sky-400"
        >
          {initialData ? "Update Experience" : "Create Experience"}
        </button>
      </div>
    </form>
  );
}

function AdminAddExperience() {
  const { addExperience } = useExperience();
  return (
    <DashboardShell title="Add New Experience">
      <ExperienceForm onSubmit={addExperience} />
    </DashboardShell>
  );
}

function AdminEditExperience() {
  const { id } = useParams();
  const { experiences, updateExperience } = useExperience();
  const experience = experiences.find((e) => e.id === id);

  if (!experience) return null;

  return (
    <DashboardShell title="Edit Experience">
      <ExperienceForm
        initialData={experience}
        onSubmit={(data) => updateExperience({ ...data, id })}
      />
    </DashboardShell>
  );
}

function AdminCertifications() {
  const navigate = useNavigate();
  const { certifications, deleteCertification } = useCertifications();

  return (
    <DashboardShell title="Manage Certifications">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">All Certifications</h2>
        <button
          onClick={() => navigate("/admin/add-certification")}
          className="rounded-2xl bg-sky-500 px-6 py-2 font-bold text-slate-950 transition hover:bg-sky-400"
        >
          Add New
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map((cert) => (
          <div key={cert.id} className="glass-card rounded-[2rem] p-6 border border-white/10 flex flex-col">
            <div className="mb-4 flex items-center gap-4">
              <img src={cert.image} alt="" className="w-12 h-12 rounded object-cover bg-white/5" />
              <div>
                <h3 className="font-bold text-white leading-snug">{cert.title}</h3>
                <p className="text-xs text-sky-400">{cert.organization}</p>
              </div>
            </div>
            {cert.featured && (
              <span className="mb-4 self-start px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 rounded-md">
                Featured
              </span>
            )}
            <div className="mt-auto flex gap-3 pt-4 border-t border-white/5">
              <button
                onClick={() => navigate(`/admin/edit-certification/${cert.id}`)}
                className="flex-1 rounded-xl bg-white/5 py-2 text-xs font-bold text-white hover:bg-white/10 transition"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Delete this certification?")) deleteCertification(cert.id);
                }}
                className="flex-1 rounded-xl bg-red-500/10 py-2 text-xs font-bold text-red-500 hover:bg-red-500/20 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

function CertificationForm({
  initialData,
  onSubmit,
}: {
  initialData?: Certification;
  onSubmit: (data: any) => void;
}) {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    organization: initialData?.organization || "",
    date: initialData?.date || "",
    credentialId: initialData?.credentialId || "",
    skills: initialData?.skills.join(", ") || "",
    image: initialData?.image || "",
    url: initialData?.url || "",
    category: initialData?.category || "AI/ML",
    featured: initialData?.featured || false,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const url = await uploadImage(file);
        setFormData((prev) => ({ ...prev, image: url }));
      } catch (err: any) {
        console.error("Image upload failed:", err);
        alert(`Image upload failed: ${err.message || err}`);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
    });
    navigate("/admin/certifications");
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-[2rem] p-8 border border-white/10 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Title
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
        </label>
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Organization
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} required />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Date
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
        </label>
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Credential ID
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400" value={formData.credentialId} onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })} required />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Category
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} list="cert-categories" required />
          <datalist id="cert-categories">
            <option value="AI/ML" />
            <option value="Web Development" />
            <option value="Cybersecurity" />
            <option value="Cloud" />
            <option value="Programming" />
          </datalist>
        </label>
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Skills (comma separated)
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} required />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Certification Image
          <div className="mt-2 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-900 border border-white/10 overflow-hidden shrink-0">
              {formData.image ? (
                <img src={formData.image} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20 cursor-pointer disabled:opacity-50"
            />
            {uploading && <span className="text-xs text-sky-400 animate-pulse">Uploading...</span>}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Or paste a URL below:</p>
          <input className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-2 text-white outline-none focus:border-sky-400 transition text-sm" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." required />
        </label>
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Verification URL
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
        </label>
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-slate-900 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900" />
        <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">Featured Certification</span>
      </label>
      <div className="flex justify-end gap-4 pt-2">
        <button type="button" onClick={() => navigate("/admin/certifications")} className="px-8 py-3 rounded-2xl bg-white/5 font-bold uppercase tracking-widest transition hover:bg-white/10">Cancel</button>
        <button type="submit" disabled={uploading} className="px-8 py-3 rounded-2xl bg-sky-500 text-slate-950 font-bold uppercase tracking-widest transition hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed">{uploading ? "Uploading..." : initialData ? "Update" : "Create"}</button>
      </div>
    </form>
  );
}

function AdminAddCertification() {
  const { addCertification } = useCertifications();
  return <DashboardShell title="Add Certification"><CertificationForm onSubmit={addCertification} /></DashboardShell>;
}

function AdminEditCertification() {
  const { id } = useParams();
  const { certifications, updateCertification } = useCertifications();
  const cert = certifications.find((c) => c.id === id);
  if (!cert) return null;
  return <DashboardShell title="Edit Certification"><CertificationForm initialData={cert} onSubmit={(data) => updateCertification({ ...data, id })} /></DashboardShell>;
}

function AdminLearningItems() {
  const navigate = useNavigate();
  const { learningItems, deleteLearningItem } = useLearningItems();

  return (
    <DashboardShell title="Manage Learning Journey">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">All Timeline Items</h2>
        <button
          onClick={() => navigate("/admin/add-learning")}
          className="rounded-2xl bg-sky-500 px-6 py-2 font-bold text-slate-950 transition hover:bg-sky-400"
        >
          Add New
        </button>
      </div>
      <div className="space-y-4">
        {learningItems.map((item) => (
          <div key={item.id} className="glass-card rounded-2xl p-6 border border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-white/5 text-slate-400 rounded-md">{item.type}</span>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${item.status === 'completed' ? 'bg-sky-500/10 text-sky-400' : item.status === 'current' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>{item.status}</span>
              </div>
              <h3 className="font-bold text-white">{item.title}</h3>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate(`/admin/edit-learning/${item.id}`)} className="rounded-xl bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition">Edit</button>
              <button onClick={() => { if (window.confirm("Delete this item?")) deleteLearningItem(item.id); }} className="rounded-xl bg-red-500/10 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/20 transition">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

function LearningItemForm({
  initialData,
  onSubmit,
}: {
  initialData?: LearningItem;
  onSubmit: (data: any) => void;
}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    type: initialData?.type || "course",
    status: initialData?.status || "upcoming",
    technologies: initialData?.technologies.join(", ") || "",
    progressPercentage: initialData?.progressPercentage || 0,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      technologies: formData.technologies.split(",").map((s) => s.trim()).filter(Boolean),
    });
    navigate("/admin/learning");
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-[2rem] p-8 border border-white/10 space-y-6">
      <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
        Title
        <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Type
          <select className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
            <option value="course">Course</option>
            <option value="progress">Progress</option>
            <option value="goal">Goal</option>
          </select>
        </label>
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Status
          <select className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
            <option value="completed">Completed</option>
            <option value="current">Current</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">
          Technologies (comma separated)
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400" value={formData.technologies} onChange={(e) => setFormData({ ...formData, technologies: e.target.value })} required />
        </label>
        <label className={`block text-sm font-bold text-slate-300 uppercase tracking-widest ${formData.status !== 'current' ? 'opacity-50' : ''}`}>
          Progress Percentage
          <input type="number" min="0" max="100" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400" value={formData.progressPercentage} onChange={(e) => setFormData({ ...formData, progressPercentage: parseInt(e.target.value) || 0 })} disabled={formData.status !== 'current'} />
        </label>
      </div>
      <div className="flex justify-end gap-4 pt-2">
        <button type="button" onClick={() => navigate("/admin/learning")} className="px-8 py-3 rounded-2xl bg-white/5 font-bold uppercase tracking-widest transition hover:bg-white/10">Cancel</button>
        <button type="submit" className="px-8 py-3 rounded-2xl bg-sky-500 text-slate-950 font-bold uppercase tracking-widest transition hover:bg-sky-400">{initialData ? "Update" : "Create"}</button>
      </div>
    </form>
  );
}

function AdminAddLearningItem() {
  const { addLearningItem } = useLearningItems();
  return <DashboardShell title="Add Timeline Item"><LearningItemForm onSubmit={addLearningItem} /></DashboardShell>;
}

function AdminEditLearningItem() {
  const { id } = useParams();
  const { learningItems, updateLearningItem } = useLearningItems();
  const item = learningItems.find((i) => i.id === id);
  if (!item) return null;
  return <DashboardShell title="Edit Timeline Item"><LearningItemForm initialData={item} onSubmit={(data) => updateLearningItem({ ...data, id })} /></DashboardShell>;
}

function DashboardShell({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <main className="min-h-screen bg-[#020308] px-6 py-10 text-slate-100 md:px-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-sky-300">
              Admin area
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{title}</h1>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={() => navigate("/")}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
            >
              Back to Site
            </button>
            <button
              onClick={() => navigate("/admin/projects")}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
            >
              Projects
            </button>
            <button
              onClick={() => navigate("/admin/experience")}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
            >
              Experience
            </button>
            <button
              onClick={() => navigate("/admin/certifications")}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
            >
              Certs
            </button>
            <button
              onClick={() => navigate("/admin/learning")}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
            >
              Learning
            </button>
            <button
              onClick={() => navigate("/admin/add-project")}
              className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Add Project
            </button>
            <button
              onClick={async () => {
                await signOut();
                navigate("/admin/login");
              }}
              className="rounded-2xl bg-rose-500/10 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-500/20 border border-rose-500/20"
            >
              Logout
            </button>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}

function QuickPanel() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10 text-slate-200 md:px-12">
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-300">
          Portfolio Experience
        </p>
        <h2 className="mt-3 text-4xl font-semibold text-white md:text-5xl">
          Fullscreen Hero and Bento Grid
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Built for an immersive portfolio experience with scroll-triggered
          video frames, smooth Lenis scrolling, and a responsive Bento-style
          about section.
        </p>
      </div>
    </section>
  );
}

function AIToolsMarquee() {
  const tools = [
    "/ai_tools/antigravity.webp",
    "/ai_tools/aws-color.webp",
    "/ai_tools/azure-color.webp",
    "/ai_tools/cloudflare-color.webp",
    "/ai_tools/github.webp",
    "/ai_tools/groq_logo.webp",
    "/ai_tools/ollama-icon.webp",
    "/ai_tools/spline_logo.webp",
    "/ai_tools/pngwing.com.png",
  ];

  return (
    <section className="bg-[#020308] py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="glass-card rounded-[2.5rem] border border-white/5 p-4 md:p-6 overflow-hidden relative group">
          {/* Faded edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#020308] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#020308] to-transparent z-10 pointer-events-none" />

          <div className="flex gap-4 md:gap-10 animate-marquee whitespace-nowrap">
            {[...tools, ...tools, ...tools].map((tool, i) => (
              <div
                key={i}
                className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-3 md:p-5 shrink-0 transition-transform duration-500 hover:scale-110 hover:border-sky-500/50"
              >
                <img
                  src={tool}
                  alt="AI Tool"
                  className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingProjects() {
  const { projects } = useProjects();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    // Generate static random values once mounted to avoid flickering
    const shuffled = [...projects].sort(() => 0.5 - Math.random()).slice(0, 6);
    const configured = shuffled.map((project) => {
      // Generate 5 random points for organic, multi-directional floating
      const generatePoints = (range: number) => [
        0,
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range,
        0,
      ];

      return {
        ...project,
        top: Math.random() * 60 + 10, // 10% to 70%
        left: Math.random() * 70 + 10, // 10% to 80%
        width: Math.random() * 60 + 100, // 100px to 160px (smaller size)
        duration: Math.random() * 25 + 30, // 30s to 55s for smoother organic feel
        delay: Math.random() * -30,
        yPoints: generatePoints(200), // larger range for more dynamic movement
        xPoints: generatePoints(200),
        rPoints: [
          0,
          Math.random() * 20 - 10,
          Math.random() * 20 - 10,
          Math.random() * 20 - 10,
          0,
        ],
      };
    });
    setItems(configured);
  }, [projects]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute pointer-events-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl glass-card group cursor-pointer transition-colors duration-500 hover:border-sky-500/50 hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]"
          style={{
            top: `${item.top}%`,
            left: `${item.left}%`,
            width: `${item.width}px`,
            aspectRatio: "16/10",
          }}
          animate={{
            y: item.yPoints,
            x: item.xPoints,
            rotate: item.rPoints,
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
            times: [0, 0.25, 0.5, 0.75, 1], // distribute animation smoothly
          }}
          whileHover={{
            scale: 1.25,
            zIndex: 50,
            transition: { duration: 0.3 },
          }}
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover filter grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-slate-950/50 opacity-100 group-hover:opacity-0 transition-opacity duration-700 pointer-events-none" />

          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none flex flex-col justify-end">
            <h4 className="text-white text-[10px] md:text-xs font-black uppercase tracking-widest truncate leading-tight mb-0.5">
              {item.title}
            </h4>
            <p className="text-sky-400 text-[8px] font-bold uppercase tracking-widest truncate">
              {item.category}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#020308] pt-24 pb-12 px-6 md:px-12 border-t border-white/5 relative overflow-hidden lg:h-[60vh] flex flex-col justify-between">
      {/* Dynamic Background Elements */}
      <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-sky-500/5 blur-[100px] rounded-full pointer-events-none will-change-transform" />
      <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none will-change-transform" />
      
      <div className="max-w-[90rem] mx-auto w-full relative z-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-gradient-to-r from-sky-500 to-transparent" />
                <span className="text-[10px] uppercase tracking-[0.5em] text-sky-400 font-black">Get in Touch</span>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter">
                READY TO <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-indigo-400">
                  INNOVATE?
                </span>
              </h2>
              
              <p className="text-slate-400 text-lg md:text-xl max-w-lg leading-relaxed font-medium">
                Let's fuse AI intelligence with premium design to build something extraordinary.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-6 pt-4">
              <motion.a
                href="mailto:ry2702763@gmail.com"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-10 py-4 bg-white text-[#020308] font-black rounded-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-sky-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 uppercase tracking-widest text-sm">Start a Project</span>
              </motion.a>
              
              <motion.button
                onClick={scrollToTop}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white/5 text-white font-black rounded-2xl border border-white/10 transition-all duration-300 uppercase tracking-widest text-sm backdrop-blur-sm"
              >
                Back to Top
              </motion.button>
            </div>
          </motion.div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:pl-12">
            <div className="space-y-8">
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-black">Explore</h3>
              <ul className="space-y-5">
                {[
                  { name: "Home", href: "#" },
                  { name: "About", href: "#about" },
                  { name: "Projects", href: "#projects-section" },
                  { name: "Stack", href: "#stack" },
                ].map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-all duration-300 text-sm font-bold flex items-center group"
                    >
                      <span className="w-0 group-hover:w-3 h-px bg-sky-500 mr-0 group-hover:mr-3 transition-all duration-300" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-black">Socials</h3>
              <ul className="space-y-5">
                {[
                  { name: "GitHub", href: "https://github.com/rahulydv-python" },
                  { name: "LinkedIn", href: "https://www.linkedin.com/in/rahul-yadav-194969327" },
                ].map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-sky-400 transition-all duration-300 text-sm font-bold flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-sky-500 transition-all duration-300" />
                      {social.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8 col-span-2 md:col-span-1">
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-black">Office</h3>
              <div className="space-y-2">
                <p className="text-sm font-bold text-white">Kathmandu</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-wider">
                  Nepal <br />
                  GMT +5:45
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-[90rem] mx-auto w-full pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8 text-[9px] uppercase tracking-[0.4em] text-slate-600 font-bold">
          <p>© {currentYear} RAHUL YADAV</p>
          <span className="hidden md:block h-1 w-1 bg-white/10 rounded-full" />
          <p>Portfolio v2.0</p>
        </div>
        
        <div className="flex items-center gap-12 text-[9px] uppercase tracking-[0.5em] text-slate-500 font-black">
          <span className="hover:text-white transition-colors cursor-default">AI ENGINEER</span>
          <span className="hover:text-white transition-colors cursor-default">UI/UX DESIGNER</span>
        </div>
      </div>
    </footer>
  );
}

function AppHeroSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const taglineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!taglineRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".tagline-word",
        { opacity: 0.15, y: 10 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: {
            trigger: taglineRef.current,
            start: "top 90%",
            end: "top 60%",
            scrub: true,
          },
        },
      );
    }, taglineRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative overflow-hidden text-white bg-[#020308]">
      <section
        ref={sectionRef}
        className="relative h-screen flex items-center justify-center"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero%20section/hero%20background.jpeg"
            alt="Background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#020308] to-transparent" />
        </div>

        <div className="absolute top-8 right-6 md:right-12 z-[100] flex items-center gap-3 md:gap-6 text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/80 md:text-white/60 md:text-sm w-max pointer-events-auto">
          <a
            href="https://www.linkedin.com/in/rahul-yadav-194969327"
            target="_blank"
            rel="noreferrer"
            className="hover:text-sky-400 transition-colors duration-300"
          >
            LinkedIn
          </a>
          <span className="text-sky-500/50">•</span>
          <a
            href="mailto:ry2702763@gmail.com"
            className="hover:text-sky-400 transition-colors duration-300"
          >
            Email
          </a>
        </div>

        <FloatingProjects />

        <div className="relative z-20 w-full max-w-[90rem] mx-auto px-6 md:px-10 h-full flex flex-col justify-end items-start md:items-start text-left md:text-left pb-44 md:pb-32">
          <div className="max-w-xl space-y-3 md:space-y-6 relative z-40 w-full text-left md:text-left pt-20 md:pt-0">
            {/* Label with minimalist accent */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-start gap-3 font-serif md:font-sans md:font-bold md:uppercase tracking-widest md:tracking-[0.3em] text-white md:text-sky-400 text-2xl md:text-[10px] lg:text-xs"
            >
              <span className="hidden md:block w-10 h-[1px] bg-sky-500/50"></span>
              <span className="md:hidden">AI/ML ENGINEER</span>
              <span className="hidden md:inline">AI/ML Engineer</span>
            </motion.div>

            {/* Minimalist Description Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-slate-300 text-[11px] md:text-base font-normal leading-relaxed tracking-wide max-w-[280px] md:max-w-md opacity-90 mx-0"
            >
              Designing immersive systems, adaptive interfaces, and future-ready
              product experiences with vision-first media and responsive AI
              workflows.
            </motion.p>

            {/* Refined Scroll Indicator (Desktop Only) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden md:flex items-center justify-start gap-4 pt-4"
            >
              <div className="flex h-10 w-6 items-end justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <span className="block h-2 w-2 rounded-full bg-sky-400 animate-bounce mb-1.5" />
              </div>
              <span className="uppercase tracking-[0.4em] text-slate-400 text-[9px] font-medium">
                Scroll to explore
              </span>
            </motion.div>
          </div>
        </div>

        {/* Mobile Cyan Down Arrow */}
        <div className="md:hidden absolute right-6 bottom-[6rem] z-30 flex flex-col items-center animate-bounce text-sky-400">
           <svg width="24" height="40" viewBox="0 0 24 40" fill="none" stroke="currentColor" strokeWidth="1.5">
             <path d="M12 0 L12 38 M4 30 L12 38 L20 30" />
           </svg>
        </div>

        {/* Foreground Image - Desktop aligned right bottom, Mobile centered */}
        <div className="hero-image-mobile-wrap w-[100vw] h-[85vh] md:w-auto md:h-auto md:absolute md:bottom-[90px] md:left-auto md:right-0 lg:right-[5%] md:relative md:z-[70] md:block md:pointer-events-none md:top-auto md:translate-x-0 md:translate-y-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="w-full h-full"
          >
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-sky-500/20 blur-[60px] md:blur-[100px] rounded-full animate-pulse md:hidden" />
            <img
              src="/hero%20section/hero%20image.png.png"
              alt="Hero Profile"
              className="hero-image-mobile-img w-full h-full object-cover object-bottom scale-110 md:w-auto md:h-[125vh] md:object-contain md:scale-150 md:origin-bottom md:relative md:z-50 pointer-events-none filter drop-shadow-[0_0_30px_rgba(56,189,248,0.2)] will-change-transform"
            />
          </motion.div>
        </div>

        {/* ── AI Skills Marquee ── */}
        <div className="skills-marquee-section absolute bottom-0 left-0 right-0 z-[60] overflow-hidden bg-slate-950/90 py-3 md:py-6 border-t border-white/5 border-b md:border-b-0 border-b-white/5">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 md:w-32 bg-gradient-to-r from-[#020308] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 md:w-32 bg-gradient-to-l from-[#020308] to-transparent" />

          <div className="skills-track skills-track--left flex whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, copy) => (
              <div key={copy} className="flex shrink-0 items-center gap-3 md:gap-4 pr-3 md:pr-4">
                {[
                  "PYTHON",
                  "GENERATIVE AI",
                  "AGENTIC AI",
                  "LLM ORCHESTRATION",
                  "PYTORCH",
                  "TENSORFLOW",
                  "PANDAS",
                  "NUMPY",
                  "LANGCHAIN",
                  "LANGGRAPH",
                  "RAG PIPELINES",
                  "AWS",
                  "AZURE",
                  "COMPUTER VISION",
                  "NLP",
                  "TRANSFORMERS",
                ].map((skill) => (
                  <span
                    key={`${skill}-${copy}`}
                    className="flex items-center gap-3 md:gap-4"
                  >
                    <span className="skills-text text-[22px] md:text-4xl lg:text-5xl font-black uppercase tracking-wider">
                      {skill}
                    </span>
                    <span className="skills-dot block h-1.5 w-1.5 md:h-3 md:w-3 shrink-0 rounded-full bg-sky-400/60" />
                  </span>
                ))}
              </div>
            ))}
          </div>
             <div className="skills-track skills-track--right flex whitespace-nowrap mt-1.5 md:mt-3">
            {Array.from({ length: 2 }).map((_, copy) => (
              <div key={copy} className="flex shrink-0 items-center gap-3 md:gap-4 pr-3 md:pr-4">
                {[
                  "AWS",
                  "AZURE",
                  "COMPUTER VISION",
                  "NLP",
                  "TRANSFORMERS",
                  "PYTHON",
                  "GENERATIVE AI",
                  "AGENTIC AI",
                  "LLM ORCHESTRATION",
                  "PYTORCH",
                  "TENSORFLOW",
                  "PANDAS",
                  "NUMPY",
                  "LANGCHAIN",
                  "LANGGRAPH",
                  "RAG PIPELINES",
                ].map((skill) => (
                  <span
                    key={`${skill}-right-${copy}`}
                    className="flex items-center gap-3"
                  >
                    <span className="skills-text text-[22px] font-black uppercase tracking-wider">
                      {skill}
                    </span>
                    <span className="skills-dot block h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400/60" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Profile & About Section ── */}
      <section id="about" className="bg-[#020308] px-6 py-4 text-slate-100 md:px-12">
        <div className="mx-auto max-w-5xl">
          {/* Tagline Section */}
          <div
            ref={taglineRef}
            className="mb-6 overflow-hidden rounded-[1.5rem] bg-transparent p-6 backdrop-blur-sm transition-all duration-500"
          >
            <h2 className="text-xl md:text-3xl font-black text-white text-center leading-tight tracking-tight">
              {"I blend creativity with technical expertise to build AI/ML solutions that drive real-world impact"
                .split(" ")
                .map((word, i) => (
                  <span
                    key={i}
                    className="tagline-word inline-block mr-[0.25em]"
                  >
                    {word}
                  </span>
                ))}
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            {/* Profile Image */}
            <TiltCard className="glass-card min-h-[300px] overflow-hidden rounded-[1.5rem] lg:min-h-0">
              <div
                className="relative h-full overflow-hidden"
                style={{ transform: "translateZ(20px)" }}
              >
                <ProfileAnimatedImage />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" />
              </div>
            </TiltCard>

            <div className="flex flex-col gap-4">
              {/* About Section */}
              <TiltCard className="glass-card rounded-[1.5rem] p-5 flex flex-col justify-center flex-1">
                <div
                  className="space-y-4"
                  style={{ transform: "translateZ(30px)" }}
                >
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-sky-300 mb-3">
                      About Me
                    </p>
                    <h2 className="text-2xl font-semibold text-white mb-2">
                      Rahul Yadav
                    </h2>
                    <p className="text-xs leading-6 text-slate-300">
                      I'm an aspiring AI/ML Engineer and BSc IT student. I'm
                      passionate about building intelligent systems and
                      exploring how data can be used to create smarter
                      solutions.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex flex-wrap gap-2">
                      {["Machine Learning", "AI Systems", "Data Science"].map(
                        (item) => (
                          <span
                            key={item}
                            className="inline-block px-3 py-1 text-[10px] rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300"
                          >
                            {item}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </TiltCard>

              {/* Music Player Section */}
              <MusicPlayer />
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Tools Marquee ── */}
      <AIToolsMarquee />

      {/* ── Selected Works Section ── */}
      <div id="projects-section">
        <SelectedWorks />
      </div>

      {/* ── Tech Arsenal Section ── */}
      <div id="stack">
        <TechStackGrid />
      </div>

      {/* ── Experience Section ── */}
      <div id="exp">
        <ExperienceSection />
      </div>

      {/* ── Certifications Section ── */}
      <CertificationsSection />

      {/* ── Learning Journey Section ── */}
      <LearningJourneySection />
      <Footer />
    </div>
  );
}

function ExperienceSection() {
  const { experiences } = useExperience();

  return (
    <section className="bg-[#020308] py-32 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/5" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-20 text-center">
          <h2 className="text-[10px] uppercase tracking-[0.8em] text-sky-400 font-black mb-2">
            Experience
          </h2>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
        </div>

        <div className="space-y-12">
          {experiences.map((exp, i) => (
            <div
              key={i}
              className={`flex flex-col md:flex-row gap-8 items-center ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
            >
              <div className="flex-1 w-full">
                <TiltCard className="glass-card p-8 rounded-[2rem] border border-white/5 hover:border-sky-500/30 transition-all duration-500 group">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black text-white mb-1 group-hover:text-sky-400 transition-colors">
                        {exp.role}
                      </h3>
                      <p className="text-sky-500/80 text-xs font-bold tracking-widest">
                        {exp.company}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 border border-white/10 px-3 py-1 rounded-full">
                      {exp.period}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-8">
                    {exp.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {exp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-slate-300 uppercase tracking-wider"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </TiltCard>
              </div>

              <div className="relative flex items-center justify-center shrink-0 w-12">
                <div className="w-4 h-4 rounded-full bg-sky-500 shadow-[0_0_15px_rgba(56,189,248,0.5)] z-20" />
                <div className="absolute w-8 h-8 rounded-full bg-sky-500/20 animate-ping" />
              </div>

              <div className="flex-1 hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CertificationsSection() {
  const { certifications } = useCertifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "AI/ML", "Web Development", "Cybersecurity", "Cloud", "Programming"];

  const filteredCerts = certifications.filter((cert) => {
    const matchesCategory = activeCategory === "All" || cert.category === activeCategory;
    const matchesSearch =
      cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="bg-[#020308] py-32 px-6 md:px-12 relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-[10px] uppercase tracking-[0.8em] text-sky-400 font-black mb-2">
            Licenses & Certifications
          </h2>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-sky-500 to-transparent mb-12" />
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-card rounded-[2rem] p-4 mb-12 border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-50 backdrop-blur-xl">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeCategory === cat
                    ? "bg-sky-500 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64 shrink-0">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search certifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCerts.map((cert) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <TiltCard className="glass-card h-full rounded-[2rem] border border-white/5 hover:border-sky-500/30 transition-all duration-500 group overflow-hidden flex flex-col">
                  <div className="relative h-40 overflow-hidden bg-white/5 flex items-center justify-center p-6">
                    <img
                      src={cert.image}
                      alt={cert.title}
                      className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020308] via-transparent to-transparent opacity-80" />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold text-sky-400 uppercase tracking-widest">
                        {cert.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <div>
                        <h3 className="text-lg font-black text-white mb-1 group-hover:text-sky-400 transition-colors leading-snug">
                          {cert.title}
                        </h3>
                        <p className="text-sky-500/80 text-[11px] font-bold tracking-widest uppercase">
                          {cert.organization}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-6">
                      <div className="text-[10px] font-mono text-slate-400">
                        <span className="block text-slate-500 mb-1">ISSUED</span>
                        {cert.date}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 text-right">
                        <span className="block text-slate-500 mb-1">
                          CREDENTIAL ID
                        </span>
                        {cert.credentialId}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {cert.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] font-bold text-slate-300 uppercase tracking-wider"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto">
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 hover:bg-sky-500 hover:text-slate-950 text-white transition-all duration-300 text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-transparent"
                      >
                        View Certificate
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function LearningJourneySection() {
  const { learningItems } = useLearningItems();
  const stats = {
    streak: 42,
    completed: learningItems.filter((i) => i.status === "completed")
      .length,
    hours: 350,
  };

  return (
    <section className="bg-[#020308] py-32 px-6 md:px-12 relative overflow-hidden border-t border-white/5">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-20 text-center">
          <h2 className="text-[10px] uppercase tracking-[0.8em] text-sky-400 font-black mb-2">
            Learning Journey
          </h2>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 items-start">
          {/* Timeline */}
          <div className="relative border-l border-white/10 ml-4 md:ml-8 space-y-12 pb-8">
            {learningItems.map((item) => (
              <div key={item.id} className="relative pl-10 md:pl-16">
                {/* Node marker */}
                <div
                  className={`absolute left-0 top-0 -translate-x-1/2 w-8 h-8 rounded-full border-4 border-[#020308] flex items-center justify-center ${
                    item.status === "completed"
                      ? "bg-sky-500 text-slate-950"
                      : item.status === "current"
                        ? "bg-sky-500/20 border-sky-500/50"
                        : "bg-slate-800"
                  }`}
                >
                  {item.status === "completed" && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {item.status === "current" && (
                    <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  )}
                </div>

                <TiltCard
                  className={`glass-card p-6 md:p-8 rounded-[2rem] border transition-all duration-500 ${
                    item.status === "upcoming"
                      ? "border-white/5 opacity-60 grayscale"
                      : "border-white/10 hover:border-sky-500/30"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-3 inline-block ${
                          item.status === "completed"
                            ? "bg-sky-500/10 text-sky-400"
                            : item.status === "current"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-white/5 text-slate-400"
                        }`}
                      >
                        {item.status}
                      </span>
                      <h3 className="text-lg font-black text-white">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {item.status === "current" &&
                    item.progressPercentage !== undefined && (
                      <div className="mb-6">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 font-mono">
                          <span>COURSE PROGRESS</span>
                          <span className="text-sky-400">
                            {item.progressPercentage}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{
                              width: `${item.progressPercentage}%`,
                            }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className="h-full bg-sky-500 rounded-full"
                          />
                        </div>
                      </div>
                    )}

                  <div className="flex flex-wrap gap-2 mt-6">
                    {item.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-slate-300 uppercase tracking-wider"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>

          {/* Stats Widget */}
          <div className="sticky top-24 space-y-6">
            <TiltCard className="glass-card p-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-500/20 blur-[50px] rounded-full pointer-events-none" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-sky-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Learning Stats
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-black text-white mb-1">
                    {stats.streak}
                  </div>
                  <div className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">
                    Day Streak
                  </div>
                </div>
                <div className="h-px w-full bg-white/10" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-black text-white mb-1">
                      {stats.completed}
                    </div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      Courses
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white mb-1">
                      {stats.hours}+
                    </div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      Hours
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>

            <TiltCard className="glass-card p-6 rounded-[2rem] border border-white/10">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Current Focus
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Agentic AI", "Kubernetes", "LangGraph"].map((focus) => (
                  <span
                    key={focus}
                    className="px-3 py-1.5 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                  >
                    {focus}
                  </span>
                ))}
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { resetProjects } = useProjects();
  const { resetTechs } = useTechStack();

  return (
    <DashboardShell title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2rem] border border-white/10">
          <h3 className="text-xl font-bold text-white mb-2">
            Projects Management
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Manage your portfolio projects, add new works, and update details.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/admin/projects")}
              className="w-full py-3 rounded-2xl bg-sky-500 text-slate-950 font-bold uppercase tracking-widest transition hover:bg-sky-400"
            >
              Go to Projects
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "This will reset all projects to the default list. Continue?",
                  )
                ) {
                  resetProjects();
                  alert("Projects reset to defaults.");
                }
              }}
              className="w-full py-3 rounded-2xl bg-white/5 text-slate-400 font-bold uppercase tracking-widest transition hover:bg-white/10 text-xs"
            >
              Reset Projects
            </button>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border border-white/10">
          <h3 className="text-xl font-bold text-white mb-2">
            Tech Stack Management
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Update your technical arsenal, add new tools, and organize
            categories.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/admin/tech-stack")}
              className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest transition hover:bg-white/10"
            >
              Manage Stack
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "This will reset your tech stack to defaults. Continue?",
                  )
                ) {
                  resetTechs();
                  alert("Tech stack reset.");
                }
              }}
              className="w-full py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase tracking-widest transition hover:bg-red-500/20"
            >
              Reset Stack
            </button>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border border-white/10">
          <h3 className="text-xl font-bold text-white mb-2">
            Experience Management
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Update your work history, add new roles, and refine your timeline.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/admin/experience")}
              className="w-full py-3 rounded-2xl bg-sky-500 text-slate-950 font-bold uppercase tracking-widest transition hover:bg-sky-400"
            >
              Go to Experience
            </button>
            <button
              onClick={() => navigate("/admin/add-experience")}
              className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest transition hover:bg-white/10"
            >
              Add Experience
            </button>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border border-white/10">
          <h3 className="text-xl font-bold text-white mb-2">
            Certifications Management
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Manage your credentials, add new licenses, and mark featured items.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/admin/certifications")}
              className="w-full py-3 rounded-2xl bg-sky-500 text-slate-950 font-bold uppercase tracking-widest transition hover:bg-sky-400"
            >
              Go to Certs
            </button>
            <button
              onClick={() => navigate("/admin/add-certification")}
              className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest transition hover:bg-white/10"
            >
              Add Cert
            </button>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border border-white/10">
          <h3 className="text-xl font-bold text-white mb-2">
            Learning Journey
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Update your current focus, track course progress, and set future goals.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/admin/learning")}
              className="w-full py-3 rounded-2xl bg-sky-500 text-slate-950 font-bold uppercase tracking-widest transition hover:bg-sky-400"
            >
              Go to Timeline
            </button>
            <button
              onClick={() => navigate("/admin/add-learning")}
              className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest transition hover:bg-white/10"
            >
              Add Item
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function ProjectsPage() {
  const { projects } = useProjects();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#020308] text-white p-6 md:p-12 lg:p-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
              Project <span className="text-sky-500">Archive</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm md:text-base leading-relaxed">
              A comprehensive collection of my work across AI, ML, and
              specialized software engineering.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs group"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <TiltCard
              key={project.id}
              className="glass-card group overflow-hidden rounded-[2rem] border border-white/10 transition-all duration-500 hover:border-sky-500/50"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

                <div className="absolute top-4 right-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                    {project.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-black text-white tracking-tight">
                    {project.title}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">
                    {project.year}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed mb-6 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {project.techStack?.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="text-[9px] font-bold text-slate-300 uppercase tracking-wider px-2 py-1 bg-white/5 rounded-md border border-white/5"
                    >
                      {tech}
                    </span>
                  ))}
                  {(project.techStack?.length || 0) > 3 && (
                    <span className="text-[9px] font-bold text-sky-400 px-2 py-1 bg-sky-500/10 rounded-md">
                      +{(project.techStack?.length || 0) - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <a
                    href={project.hostedLink}
                    target="_blank"
                    rel="noreferrer"
                    className="group/link flex items-center gap-2 text-[10px] font-bold text-sky-400 uppercase tracking-[0.2em] transition-all hover:text-white"
                  >
                    <span>Live Site</span>
                    <svg
                      className="w-3 h-3 transition-transform group-hover/link:-rotate-45"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020308] flex items-center justify-center p-10 text-white">
          <div className="max-w-xl w-full glass-card p-8 rounded-3xl border border-rose-500/30">
            <h2 className="text-2xl font-bold text-rose-400 mb-4">
              Application Error
            </h2>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              The application encountered a runtime error. This usually happens
              due to missing assets or data parsing issues.
            </p>
            <pre className="bg-black/50 p-4 rounded-xl text-xs overflow-auto max-h-40 border border-white/5 mb-6 text-slate-300">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-2xl bg-sky-500 text-slate-950 font-bold uppercase tracking-widest transition hover:bg-sky-400"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
        <CustomCursor />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<AppHeroSection />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route
              path="/admin/tech-stack"
              element={
                <ProtectedRoute>
                  <TechStackManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects"
              element={
                <ProtectedRoute>
                  <AdminProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-project"
              element={
                <ProtectedRoute>
                  <AdminAddProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit-project/:id"
              element={
                <ProtectedRoute>
                  <AdminEditProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/experience"
              element={
                <ProtectedRoute>
                  <AdminExperience />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-experience"
              element={
                <ProtectedRoute>
                  <AdminAddExperience />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit-experience/:id"
              element={
                <ProtectedRoute>
                  <AdminEditExperience />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/certifications"
              element={
                <ProtectedRoute>
                  <AdminCertifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-certification"
              element={
                <ProtectedRoute>
                  <AdminAddCertification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit-certification/:id"
              element={
                <ProtectedRoute>
                  <AdminEditCertification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/learning"
              element={
                <ProtectedRoute>
                  <AdminLearningItems />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-learning"
              element={
                <ProtectedRoute>
                  <AdminAddLearningItem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit-learning/:id"
              element={
                <ProtectedRoute>
                  <AdminEditLearningItem />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
