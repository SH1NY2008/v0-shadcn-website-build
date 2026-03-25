
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, MessageSquare, Briefcase } from "lucide-react";

const communityLinks = [
  {
    title: "Discussion Threads",
    description: "Help each other, and learn together.",
    href: "/community/discussion",
    icon: <MessageSquare className="w-12 h-12 text-[#FFC971]" />,
  },
  {
    title: "Study Groups",
    description: "Form small cohorts and tackle challenges.",
    href: "/community/studygroups",
    icon: <Users className="w-12 h-12 text-[#FFC971]" />,
  },
  {
    title: "Peer Review",
    description: "Grade each other's work and provide feedback.",
    href: "/community/peerreview",
    icon: <Briefcase className="w-12 h-12 text-[#FFC971]" />,
  },
];

export function CommunitySection() {
  return (
    <div className="w-full bg-[#006B6B] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-[0.85]">
            Welcome to the Community
          </h2>
          <p className="text-xl font-bold text-[#FFC971] max-w-2xl mx-auto mt-4">
            Engage, collaborate, and learn with your peers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {communityLinks.map((link) => (
            <Link key={link.title} href={link.href}>
              <div className="bg-[#FFC971] rounded-2xl p-8 h-full flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)] transition-shadow duration-300">
                <div>
                  <div className="bg-[#005555] rounded-full w-20 h-20 flex items-center justify-center mb-6">
                    {link.icon}
                  </div>
                  <h3 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">
                    {link.title}
                  </h3>
                  <p className="text-lg font-bold text-[#2C2C2C]/60 mt-2">
                    {link.description}
                  </p>
                </div>
                <Button className="mt-8 w-full bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  Go to {link.title}
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
