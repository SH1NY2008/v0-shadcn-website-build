
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { getStudyGroup, getStudyGroupMembers, getStudyGroupChallenges, joinStudyGroup, leaveStudyGroup, type StudyGroup, type Member, type Challenge } from "@/lib/community";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

export default function StudyGroupPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [studyGroup, setStudyGroup] = useState<StudyGroup | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const group = await getStudyGroup(params.id);
      setStudyGroup(group);
      if (group) {
        const groupMembers = await getStudyGroupMembers(params.id);
        setMembers(groupMembers);
        const groupChallenges = await getStudyGroupChallenges(params.id);
        setChallenges(groupChallenges);
      }
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  const handleJoinGroup = async () => {
    if (!user) return;
    await joinStudyGroup(params.id, user.uid);
    const updatedMembers = await getStudyGroupMembers(params.id);
    setMembers(updatedMembers);
  };

  const handleLeaveGroup = async () => {
    if (!user) return;
    await leaveStudyGroup(params.id, user.uid);
    const updatedMembers = await getStudyGroupMembers(params.id);
    setMembers(updatedMembers);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!studyGroup) {
    return <div>Study group not found</div>;
  }

  const isMember = members.some(member => member.id === user?.uid);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{studyGroup.title}</h1>
          <p className="text-lg text-gray-500">{studyGroup.description}</p>
        </div>
        {user && (
          isMember ? (
            <Button onClick={handleLeaveGroup}>Leave Group</Button>
          ) : (
            <Button onClick={handleJoinGroup}>Join Group</Button>
          )
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Group Challenges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {challenges.map((challenge) => (
                <div key={challenge.id}>
                  <p className="font-bold">{challenge.title}</p>
                  <Progress value={challenge.progress} className="mt-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Members ({members.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="font-bold">{member.name}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
