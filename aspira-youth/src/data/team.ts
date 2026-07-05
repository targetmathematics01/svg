export type TeamMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  skills: string[];
  education: string;
  email: string;
};

export const teamMembers: TeamMember[] = [
  {
    id: "member-1",
    name: "Thiri Aung",
    role: "Project Coordinator",
    image: "/team/team_member_1_1783263677369.png",
    bio: "Thiri oversees our educational programs and ensures that every child receives the support they need. She has over 5 years of experience in youth development and community outreach.",
    skills: ["Project Management", "Community Outreach", "Youth Mentoring"],
    education: "B.A. in Social Science, Yangon University",
    email: "thiri@aspirayouth.org",
  },
  {
    id: "member-2",
    name: "Aye Myat Thu",
    role: "Lead Educator",
    image: "/team/team_member_2_1783263688155.png",
    bio: "Aye Myat is passionate about creating engaging and inclusive curriculum for children who have missed out on formal education.",
    skills: ["Curriculum Design", "Early Childhood Education", "Counseling"],
    education: "B.Ed. in Education, Yangon University of Education",
    email: "ayemyat@aspirayouth.org",
  },
  {
    id: "member-3",
    name: "Khin Yadanar",
    role: "Community Relations Manager",
    image: "/team/team_member_3_1783263697949.png",
    bio: "Khin bridges the gap between our organization and the local communities, ensuring that our programs are culturally sensitive and highly impactful.",
    skills: ["Public Relations", "Event Organizing", "Negotiation"],
    education: "B.A. in Communications",
    email: "khin@aspirayouth.org",
  },
  {
    id: "member-4",
    name: "May Zin Phyo",
    role: "Technology Instructor",
    image: "/team/team_member_4_1783263707332.png",
    bio: "May Zin teaches basic computer skills and digital literacy, preparing the youth for the modern digital world. She believes technology is the great equalizer.",
    skills: ["IT Support", "Web Development", "Digital Literacy Training"],
    education: "B.C.Sc. in Computer Science",
    email: "mayzin@aspirayouth.org",
  },
  {
    id: "member-5",
    name: "Su Myat Noe",
    role: "Social Worker",
    image: "/team/team_member_5_1783263718144.png",
    bio: "Su provides emotional and psychological support to IDP children and orphans, helping them navigate trauma and build resilience.",
    skills: ["Trauma-Informed Care", "Child Psychology", "Case Management"],
    education: "B.A. in Psychology",
    email: "sumyat@aspirayouth.org",
  },
  {
    id: "member-6",
    name: "Zin Mar Htun",
    role: "Operations & Fundraising",
    image: "/team/team_member_6_1783263727990.png",
    bio: "Zin manages our resources and leads fundraising campaigns. Her efforts ensure that our programs remain free and accessible to everyone.",
    skills: ["Fundraising", "Financial Management", "Grant Writing"],
    education: "B.B.A. in Business Administration",
    email: "zinmar@aspirayouth.org",
  }
];
