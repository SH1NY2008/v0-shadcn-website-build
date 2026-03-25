
'use client'

import { useParams } from 'next/navigation'
import { PageLayout } from "@/components/page-layout"
import workedExamples from '@/app/data/worked-examples.json'
import { MathText } from '../../components/MathText'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ExamplePage() {
  const params = useParams()
  const exampleId = params.id as string

  const example = workedExamples.find(e => e.id === exampleId)

  if (!example) {
    return <PageLayout>Example not found.</PageLayout>
  }

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{example.title}</h1>
        <div className="prose dark:prose-invert max-w-none">
            <MathText content={example.problem} />
        </div>

        <h2 className="text-2xl font-bold mt-12 mb-4">Step-by-step Solution</h2>
        <Accordion type="single" collapsible className="w-full">
            {example.solution.map(step => (
                <AccordionItem key={step.step} value={`item-${step.step}`}>
                    <AccordionTrigger>Step {step.step}: {step.title}</AccordionTrigger>
                    <AccordionContent>
                        <div className="prose dark:prose-invert max-w-none">
                            <MathText content={step.explanation} />
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </div>
    </PageLayout>
  )
}
