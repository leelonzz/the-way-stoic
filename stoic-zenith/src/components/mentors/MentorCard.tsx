
import React from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MentorCardProps {
  name: string;
  title: string;
  description: string;
  expertise: string[];
  greeting: string;
  onStartChat: () => void;
}

export function MentorCard({ name, title, description, expertise, greeting, onStartChat }: MentorCardProps) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-stone/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cta to-accent rounded-full flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl font-serif text-ink">{name}</CardTitle>
        <p className="text-stone font-medium">{title}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-stone/80 text-sm leading-relaxed">{description}</p>
        
        <div className="space-y-2">
          <h4 className="font-medium text-ink text-sm">Expertise:</h4>
          <div className="flex flex-wrap gap-2">
            {expertise.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-sage/20 text-sage text-xs rounded-full border border-sage/30"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <div className="p-3 bg-hero/50 rounded-lg border-l-4 border-accent">
          <p className="text-sm italic text-ink">"{greeting}"</p>
        </div>
        
        <Button
          onClick={onStartChat}
          className="w-full bg-cta hover:bg-cta/90 text-white group-hover:scale-[1.02] transition-transform"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Begin Conversation
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
