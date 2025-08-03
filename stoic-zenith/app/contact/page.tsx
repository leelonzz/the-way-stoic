'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { useState } from 'react'

export default function ContactPage(): JSX.Element {
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    country: '',
    companyWebsite: '',
    jobFunction: '',
    message: ''
  })

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
  }

  return (
    <div className="min-h-screen bg-parchment">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-stone hover:text-ink">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-ink mb-4">
              Contact Us
            </h1>
          </div>
        </div>

        {/* Contact Form */}
        <Card className="bg-white/50 backdrop-blur-sm border-stone/20 max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-ink mb-2">
                Let&apos;s get you to the right place
              </h2>
              <p className="text-stone">
                Reach out to our sales team! We&apos;re eager to learn more about how you plan to use our application.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-ink font-medium">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="bg-white/70 border-stone/20 focus:border-primary"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workEmail" className="text-ink font-medium">
                  Work Email
                </Label>
                <Input
                  id="workEmail"
                  type="email"
                  value={formData.workEmail}
                  onChange={(e) => handleInputChange('workEmail', e.target.value)}
                  className="bg-white/70 border-stone/20 focus:border-primary"
                  placeholder="Enter your work email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-ink font-medium">
                  Country/Region
                </Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger className="bg-white/70 border-stone/20 focus:border-primary">
                    <SelectValue placeholder="Select Country/Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="fr">France</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyWebsite" className="text-ink font-medium">
                  Company Website
                </Label>
                <Input
                  id="companyWebsite"
                  type="url"
                  value={formData.companyWebsite}
                  onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                  className="bg-white/70 border-stone/20 focus:border-primary"
                  placeholder="https://yourcompany.com"
                />
                                  <p className="text-sm text-stone/70">Must start with &apos;https&apos;</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobFunction" className="text-ink font-medium">
                  Job function
                </Label>
                <Select value={formData.jobFunction} onValueChange={(value) => handleInputChange('jobFunction', value)}>
                  <SelectTrigger className="bg-white/70 border-stone/20 focus:border-primary">
                    <SelectValue placeholder="Select Job Function" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="product">Product Management</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-ink font-medium">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="bg-white/70 border-stone/20 focus:border-primary min-h-[120px] resize-none"
                  placeholder="Tell us about your project and how we can help..."
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 