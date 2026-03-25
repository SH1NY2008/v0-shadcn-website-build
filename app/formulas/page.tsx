
'use client'

import { PageLayout } from "@/components/page-layout"
import formulaData from '@/app/data/formulas.json'
import { MathText } from '../components/MathText'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FormulaSheetPage() {

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Formula Sheet</h1>
        
        {Object.entries(formulaData).map(([category, formulas]) => (
            <div key={category} className="mb-8">
                <h2 className="text-2xl font-bold mb-4 border-b pb-2">{category}</h2>
                <Accordion type="multiple" className="w-full">
                    {formulas.map((formula, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger>{formula.name}</AccordionTrigger>
                            <AccordionContent>
                                <div className="text-lg p-4">
                                    <MathText content={formula.formula} />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        ))}
      </div>
    </PageLayout>
  )
}
