// Three complementary research pillars, approved in discussion with Dr Di Fu.
// These are a reciprocal framework, not mandatory steps for every project.
export const researchFramework = {
  title: "Cognition-Inspired Social Intelligence",
  subtitle:
    "Connecting human mechanisms, computational models and interactive systems",
  introduction:
    "We investigate the neurocognitive mechanisms of human social behaviour, formalise selected mechanisms as computational models, and evaluate them through robotic simulation and interaction studies. Evidence from these studies refines both the models and our understanding of human cognition. Robots serve as interaction partners and experimental platforms; our interaction research also includes conversational AI without a physical body.",
  caption:
    "A reciprocal, synthetic approach: mechanisms of human social cognition are formalised as computational models that generate human-like social behaviour in artificial agents. How people perceive and interact with these agents provides a controlled yet ecologically valid test of both the models and the cognitive theories they embody.",
  pillars: [
    {
      id: "human-social-cognition",
      number: "01",
      title: "Neurocognitive Mechanisms of Social Cognition",
      shortTitle: "Human Social Cognition",
      focus: "Understand human mechanisms",
      homeSummary:
        "Investigate how social attention, crossmodal integration and cognitive control shape human social behaviour.",
      description:
        "Identify how social information is perceived and integrated, how attention and cognitive control guide responses, and how affective and social evaluations shape behaviour. Behavioural experiments and cognitive neuroscience provide empirical constraints for modelling.",
      keywords: [
        "Social attention",
        "Crossmodal integration",
        "Cognitive control",
      ],
      themeIds: ["crossmodal-social-cues", "social-attention"],
    },
    {
      id: "human-inspired-modelling",
      number: "02",
      title: "Human-Inspired Computational Modelling & AI",
      shortTitle: "Computational Modelling & AI",
      focus: "Formalise and predict",
      homeSummary:
        "Translate human mechanisms and behavioural evidence into computational models and learning systems for cognition-inspired AI.",
      description:
        "Translate selected human mechanisms and behavioural evidence into computational models and learning systems. Attention modelling, scanpath prediction and crossmodal learning generate testable predictions and inform cognition-inspired embodied AI.",
      keywords: ["Computational models", "Crossmodal learning", "Embodied AI"],
      themeIds: ["embodied-ai"],
    },
    {
      id: "robotic-simulation-interaction",
      number: "03",
      title: "Robotic Simulation & Human-Agent Interaction",
      shortTitle: "Simulation & Interaction",
      focus: "Implement, evaluate and refine",
      homeSummary:
        "Test models through robotic simulation and human-robot or human-AI interaction, using new evidence to refine models and cognitive hypotheses.",
      description:
        "Evaluate model-driven behaviour through cognitive robotic simulation and studies of human-robot cooperation and human-AI interaction. Examine how social cues, emotional context and individual differences shape behaviour and experience, generating evidence to refine models and cognitive hypotheses.",
      keywords: [
        "Robotic simulation",
        "Human-robot cooperation",
        "Human-AI interaction",
      ],
      themeIds: ["social-robotics", "human-ai-interaction"],
    },
  ],
  connections: [
    {
      from: "human-social-cognition",
      to: "human-inspired-modelling",
      label: "Mechanistic constraints",
      description:
        "Behavioural and neural evidence constrains the architecture and parameters of computational models.",
    },
    {
      from: "human-inspired-modelling",
      to: "robotic-simulation-interaction",
      label: "Embodied implementation",
      description:
        "Models are implemented on robots and conversational agents, generating human-like social behaviour under controlled conditions.",
    },
    {
      from: "robotic-simulation-interaction",
      to: "human-social-cognition",
      label: "Interactive validation & new hypotheses",
      description:
        "Interaction studies test whether model-driven behaviour is perceived as socially meaningful, validating the models and generating new hypotheses about human social cognition.",
    },
  ],
} as const;
