
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, MessageSquare, Briefcase, ArrowRight } from "lucide-react";

const communityLinks = [
  {
    title: "Discussion Threads",
    description: "Help each other, and learn together.",
    href: "/community/discussion",
    icon: <MessageSquare className="h-6 w-6" />,
    count: 128,
  },
  {
    title: "Study Groups",
    description: "Form small cohorts and tackle challenges.",
    href: "/community/studygroups",
    icon: <Users className="h-6 w-6" />,
    count: 20,
  },
  {
    title: "Peer Review",
    description: "Grade each other's work and provide feedback.",
    href: "/community/peerreview",
    icon: <Briefcase className="h-6 w-6" />,
    count: 35,
  },
];

export function CommunitySection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {communityLinks.map((link) => (
        <div 
          key={link.title} 
          className="group flex flex-col justify-between rounded-xl border-4 border-black/10 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]"
        >
          <div>
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border-4 border-black/10 bg-[#FFC971] text-[#2C2C2C] transition-transform group-hover:scale-110 group-hover:rotate-3">
                {link.icon}
              </div>
            </div>
            <h3 className="mb-3 text-2xl font-black uppercase leading-[0.9] text-[#2C2C2C]">
              {link.title}
            </h3>
            <p className="text-sm font-bold text-[#2C2C2C]/60 leading-tight">
              {link.description}
            </p>
          </div>
          <div className="mt-8">
            <Link href={link.href} className="w-full block">
              <Button className="w-full gap-2 border-4 border-black/10 bg-[#006B6B] hover:bg-[#005555] text-white font-bold text-lg h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[2px] transition-all">
                Explore
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
