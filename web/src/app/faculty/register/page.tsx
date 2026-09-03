"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Label } from "../../../components/ui/label"
import { Checkbox } from "../../../components/ui/checkbox"
import { Alert, AlertDescription } from "../../../components/ui/alert"
import { Navigation } from "../../../components/Navigation"
import { CheckCircle, Loader2, AlertCircle, GraduationCap, UserPlus, Lock, CreditCard, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { conferenceConfig } from "../../../config/conference.config"

const TITLES = conferenceConfig.registration.formFields.titles
const RELATIONSHIP_TYPES = conferenceConfig.registration.formFields.relationshipTypes

export default function FacultyRegisterPage() {
  const [step, setStep] = useState(1) // 1=form, 2=payment
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionData, setSubmissionData] = useState<any>(null)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null)

  const [formData, setFormData] = useState({
    title: "Dr.", firstName: "", lastName: "", email: "", phone: "", age: "",
    institution: "", mciNumber: "", specialization: "",
    address: "", city: "", state: "", country: "India", pincode: "",
    dietaryRequirements: "", specialNeeds: "",
    accompanyingPersons: [] as Array<{ name: string; age: number; relationship: string; dietaryRequirements?: string }>,
    agreeTerms: false,
  })

  const [priceCalculation, setPriceCalculation] = useState<any>(null)

  // Faculty always pays the TAS Member fee (no hotel accommodation)
  const hasAccompanying = formData.accompanyingPersons.length > 0
  const needsPayment = true

  // Fetch real pricing from the payment/calculate API (same as delegate registration)
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('/api/payment/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationType: 'faculty',
            workshopSelections: [],
            accompanyingPersons: formData.accompanyingPersons,
            phone: formData.phone,
          })
        })
        if (res.ok) {
          const result = await res.json()
          if (result.success) setPriceCalculation(result.data)
        }
      } catch {}
    }
    fetchPrice()
  }, [JSON.stringify(formData.accompanyingPersons), formData.phone])

  // Prices are GST-inclusive — charge the base registration fee + accompanying fees, no GST added on top
  const baseFee = priceCalculation?.registrationFee ?? priceCalculation?.baseAmount ?? 0
  const accompanyingFee = priceCalculation?.accompanyingPersonFees ?? priceCalculation?.accompanyingPersons ?? 0
  const totalAmount = baseFee + accompanyingFee

  useEffect(() => {
    document.title = `Faculty Registration | ${conferenceConfig.shortName}`
    // Load Razorpay checkout SDK
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (!existing) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
    }
    return () => { if (emailCheckTimeout) clearTimeout(emailCheckTimeout) }
  }, [emailCheckTimeout])

  const checkEmailUniqueness = useCallback(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    setIsCheckingEmail(true)
    try {
      const res = await fetch("/api/auth/check-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim().toLowerCase() }) })
      if (res.ok) { const r = await res.json(); setEmailAvailable(r.available); if (!r.available) toast.error("This email is already registered.") }
    } catch {} finally { setIsCheckingEmail(false) }
  }, [])

  const handleEmailChange = useCallback((email: string) => {
    setFormData(prev => ({ ...prev, email: email.toLowerCase() }))
    setEmailAvailable(null)
    if (emailCheckTimeout) clearTimeout(emailCheckTimeout)
    if (email.includes("@") && email.includes(".")) { const t = setTimeout(() => checkEmailUniqueness(email), 1000); setEmailCheckTimeout(t) }
  }, [emailCheckTimeout, checkEmailUniqueness])

  const updateField = useCallback((field: string, value: any) => { setFormData(prev => ({ ...prev, [field]: value })) }, [])

  const addAccompanyingPerson = () => {
    if (formData.accompanyingPersons.length >= (conferenceConfig.registration.maxAccompanyingPersons || 3)) { toast.error(`Maximum ${conferenceConfig.registration.maxAccompanyingPersons || 3} accompanying persons allowed`); return }
    setFormData(prev => ({ ...prev, accompanyingPersons: [...prev.accompanyingPersons, { name: "", age: 0, relationship: "Spouse" }] }))
  }
  const removeAccompanyingPerson = (index: number) => { setFormData(prev => ({ ...prev, accompanyingPersons: prev.accompanyingPersons.filter((_, i) => i !== index) })) }
  const updateAccompanyingPerson = (index: number, field: string, value: any) => { setFormData(prev => ({ ...prev, accompanyingPersons: prev.accompanyingPersons.map((p, i) => i === index ? { ...p, [field]: value } : p) })) }

  const validateStep1 = (): boolean => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) { toast.error("First and last name are required"); return false }
    if (!formData.email.trim() || emailAvailable === false) { toast.error("Valid email is required"); return false }
    if (!formData.phone.trim() || !/^[0-9]{10}$/.test(formData.phone)) { toast.error("Valid 10-digit phone required"); return false }
    if (!formData.city.trim() || !formData.state.trim()) { toast.error("City and state are required"); return false }
    if (!formData.agreeTerms) { toast.error("Please agree to the terms"); return false }
    for (const p of formData.accompanyingPersons) { if (!p.name.trim()) { toast.error("All accompanying person names are required"); return false } }
    return true
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep1()) return
    setStep(2); window.scrollTo(0, 0)
  }

  // Gateway payment: create order → Razorpay → verify (which creates the account after success)
  const handlePayNow = async () => {
    if (totalAmount <= 0 || !priceCalculation) { toast.error("Pricing is still loading, please wait a moment"); return }
    // @ts-ignore
    if (typeof window === 'undefined' || !window.Razorpay) { toast.error("Payment gateway is still loading, please try again"); return }

    setIsLoading(true)
    try {
      // Re-check email availability before charging
      try {
        const emailCheck = await fetch('/api/auth/check-email', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email.trim().toLowerCase() })
        })
        const emailResult = await emailCheck.json()
        if (!emailResult.available) {
          toast.error("This email is already registered. Please sign in instead.")
          setIsLoading(false); return
        }
      } catch {}

      const tempRegId = `T${Date.now().toString(36).toUpperCase()}`
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: priceCalculation?.currency || 'INR',
          registrationId: tempRegId,
          email: formData.email.trim().toLowerCase(),
          name: `${formData.firstName} ${formData.lastName}`
        })
      })
      const orderData = await orderRes.json()
      if (!orderData.success) {
        toast.error(orderData.message || "Failed to create payment order")
        setIsLoading(false); return
      }

      // Data used by verify to create the account AFTER payment succeeds
      const pendingData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.phone.replace(/\D/g, ''), // mobile number is the password
        profile: {
          title: formData.title,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          age: parseInt(formData.age) || 0,
          designation: 'Faculty',
          specialization: formData.specialization,
          institution: formData.institution,
          mciNumber: formData.mciNumber,
          address: {
            street: formData.address, city: formData.city, state: formData.state,
            country: formData.country, pincode: formData.pincode
          },
          dietaryRequirements: formData.dietaryRequirements,
          specialNeeds: formData.specialNeeds
        },
        registration: {
          type: 'faculty',
          workshopSelections: [],
          accompanyingPersons: formData.accompanyingPersons,
          accommodation: { required: false }
        },
        payment: { method: 'pay-now', amount: totalAmount }
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: conferenceConfig.shortName,
        description: 'Faculty Registration Fee',
        order_id: orderData.data.id,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        theme: { color: conferenceConfig.theme.primary },
        handler: async function (response: any) {
          setIsLoading(true)
          toast.success("Payment successful — completing your registration...")
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                pendingRegistration: pendingData
              })
            })
            const verifyResult = await verifyResponse.json()
            setIsLoading(false)
            if (verifyResult.success) {
              setSubmissionData({
                registrationId: verifyResult.data.registrationId,
                name: `${formData.firstName} ${formData.lastName}`,
                status: 'paid',
                paymentId: response.razorpay_payment_id,
                amount: orderData.data.amount / 100
              })
              setIsSubmitted(true)
            } else if (verifyResult.paymentSuccessful) {
              toast.error(verifyResult.message || "Payment succeeded but registration needs manual completion.")
              alert(`✅ Payment Successful!\n\n${verifyResult.message}\n\nPayment ID: ${verifyResult.support?.paymentId}\nOrder ID: ${verifyResult.support?.orderId}\n\nPlease contact: ${verifyResult.support?.email}`)
            } else {
              toast.error(verifyResult.message || "Failed to complete registration")
            }
          } catch {
            setIsLoading(false)
            toast.error("Failed to verify payment. Please contact support.")
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false)
            toast.error("Payment cancelled. No charges applied.")
          }
        }
      }

      // @ts-ignore
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      setIsLoading(false)
      toast.error("Something went wrong starting the payment. Please try again.")
    }
  }

  // Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center p-8 lg:p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Faculty Registration Complete!</h2>
          {submissionData && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="text-sm text-green-700 dark:text-green-300 space-y-1 text-left">
                <p><strong>Registration ID:</strong> {submissionData.registrationId}</p>
                <p><strong>Name:</strong> {submissionData.name}</p>
                <p><strong>Type:</strong> Faculty</p>
                {submissionData.amount ? <p><strong>Amount Paid:</strong> ₹{submissionData.amount.toLocaleString('en-IN')}</p> : null}
                <p><strong>Status:</strong> Confirmed</p>
              </div>
            </div>
          )}
          <Alert className="mb-6 text-left bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payment received and your registration is confirmed. Log in with your <strong>email</strong> and <strong>mobile number</strong> as the password.
            </AlertDescription>
          </Alert>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">📧 A confirmation email with your details has been sent.</p>
          <div className="flex flex-col gap-3">
            <Link href="/auth/login"><Button className="w-full bg-green-600 hover:bg-green-700">Login to Dashboard</Button></Link>
            <Link href="/"><Button variant="outline" className="w-full">Go Home</Button></Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <div className="pt-24 pb-12">
        <section className="py-12 bg-gradient-to-r from-[#002552] to-[#001B3D] text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <GraduationCap className="w-5 h-5 mr-2" />
                <span className="font-semibold">Faculty Registration</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Faculty Registration</h1>
              <p className="text-lg text-blue-200 max-w-2xl mx-auto">
                Faculty registration for {conferenceConfig.shortName}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Step indicator */}
        {needsPayment && (
          <div className="container mx-auto px-4 mt-6">
            <div className="max-w-3xl mx-auto flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${step === 1 ? 'bg-[#002552] text-white' : 'bg-green-100 text-green-800'}`}>
                {step > 1 ? <CheckCircle className="w-4 h-4" /> : <span>1</span>} Registration Details
              </div>
              <div className="w-8 h-0.5 bg-gray-300" />
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${step === 2 ? 'bg-[#002552] text-white' : 'bg-gray-100 text-gray-500'}`}>
                <span>2</span> Payment
              </div>
            </div>
          </div>
        )}

        <section className="py-8">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">

              {/* STEP 1: Registration Form */}
              {step === 1 && (
              <Card className="bg-white dark:bg-gray-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-[#002552]" /> Faculty Registration Form</CardTitle>
                  <Alert className="bg-blue-50 border-blue-200">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Faculty registration is charged at the <strong>TAS Member</strong> rate. Accompanying persons, if any, are charged separately.
                    </AlertDescription>
                  </Alert>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNext} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-800 dark:text-white border-b pb-2">Personal Information</h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label>Title</Label>
                          <Select value={formData.title} onValueChange={(v) => updateField("title", v)}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>{TITLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          <Label>First Name <span className="text-red-500">*</span></Label>
                          <Input value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} placeholder="First name" className="mt-1" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Last Name <span className="text-red-500">*</span></Label><Input value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} placeholder="Last name" className="mt-1" /></div>
                        <div><Label>Age</Label><Input type="number" value={formData.age} onChange={(e) => updateField("age", e.target.value)} placeholder="Age" min="18" max="100" className="mt-1" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Email <span className="text-red-500">*</span></Label>
                          <div className="relative mt-1">
                            <Input type="email" value={formData.email} onChange={(e) => handleEmailChange(e.target.value)} placeholder="email@example.com" className={`pr-10 ${emailAvailable === false ? "border-red-500" : emailAvailable === true ? "border-green-500" : ""}`} />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {isCheckingEmail && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                              {!isCheckingEmail && emailAvailable === true && <CheckCircle className="w-4 h-4 text-green-500" />}
                              {!isCheckingEmail && emailAvailable === false && <AlertCircle className="w-4 h-4 text-red-500" />}
                            </div>
                          </div>
                        </div>
                        <div><Label>Phone <span className="text-red-500">*</span></Label><Input value={formData.phone} onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" maxLength={10} className="mt-1" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Institution</Label><Input value={formData.institution} onChange={(e) => updateField("institution", e.target.value)} placeholder="Your institution" className="mt-1" /></div>
                        <div><Label>MCI/NMC Number</Label><Input value={formData.mciNumber} onChange={(e) => updateField("mciNumber", e.target.value)} placeholder="Registration number" className="mt-1" /></div>
                      </div>
                      <div><Label>Specialization</Label><Input value={formData.specialization} onChange={(e) => updateField("specialization", e.target.value)} placeholder="e.g., Hand Surgery" className="mt-1" /></div>
                    </div>

                    {/* Login info note */}
                    <Alert className="bg-blue-50 border-blue-200">
                      <Lock className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800 text-sm">
                        Your <strong>mobile number</strong> is your login password. Use your email and mobile number to sign in later.
                      </AlertDescription>
                    </Alert>

                    {/* Address */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-800 dark:text-white border-b pb-2">Address</h3>
                      <Input value={formData.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Street address" />
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>City <span className="text-red-500">*</span></Label><Input value={formData.city} onChange={(e) => updateField("city", e.target.value)} placeholder="City" className="mt-1" /></div>
                        <div><Label>State <span className="text-red-500">*</span></Label><Input value={formData.state} onChange={(e) => updateField("state", e.target.value)} placeholder="State" className="mt-1" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input value={formData.country} onChange={(e) => updateField("country", e.target.value)} placeholder="Country" />
                        <Input value={formData.pincode} onChange={(e) => updateField("pincode", e.target.value)} placeholder="Pincode" />
                      </div>
                    </div>

                    {/* Accompanying Persons */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="font-semibold text-gray-800 dark:text-white">Accompanying Persons</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addAccompanyingPerson}>+ Add Person</Button>
                      </div>

                      {formData.accompanyingPersons.map((person, idx) => (
                        <div key={idx} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">Person {idx + 1}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeAccompanyingPerson(idx)} className="text-red-500 h-8">Remove</Button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-1"><Label>Name <span className="text-red-500">*</span></Label><Input value={person.name} onChange={(e) => updateAccompanyingPerson(idx, "name", e.target.value)} placeholder="Full name" className="mt-1" /></div>
                            <div><Label>Age</Label><Input type="number" value={person.age || ""} onChange={(e) => updateAccompanyingPerson(idx, "age", parseInt(e.target.value) || 0)} placeholder="Age" min="0" className="mt-1" /></div>
                            <div><Label>Relationship</Label>
                              <Select value={person.relationship} onValueChange={(v) => updateAccompanyingPerson(idx, "relationship", v)}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>{RELATIONSHIP_TYPES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Dietary & Special Needs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Dietary Requirements</Label>
                        <Select value={formData.dietaryRequirements} onValueChange={(v) => updateField("dietaryRequirements", v)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Select if any" /></SelectTrigger>
                          <SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="vegetarian">Vegetarian</SelectItem><SelectItem value="vegan">Vegan</SelectItem><SelectItem value="halal">Halal</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div><Label>Special Needs</Label><Input value={formData.specialNeeds} onChange={(e) => updateField("specialNeeds", e.target.value)} placeholder="Any special requirements" className="mt-1" /></div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-3 pt-4 border-t">
                      <Checkbox id="terms" checked={formData.agreeTerms} onCheckedChange={(checked) => updateField("agreeTerms", checked as boolean)} />
                      <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                        I agree to the <Link href="/terms-conditions" className="text-[#002552] hover:underline" target="_blank">Terms</Link> and <Link href="/privacy-policy" className="text-[#002552] hover:underline" target="_blank">Privacy Policy</Link>
                      </label>
                    </div>

                    <Button type="submit" className="w-full bg-[#002552] hover:bg-[#002552] py-6 text-lg" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : needsPayment ? <>Proceed to Payment →</> : <><GraduationCap className="w-5 h-5 mr-2" />Complete Faculty Registration</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              )}

              {/* STEP 2: Payment */}
              {step === 2 && (
              <Card className="bg-white dark:bg-gray-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#002552]" /> Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Price Summary */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Payment Summary</h3>
                      {priceCalculation ? (
                      <div className="space-y-2">
                        <div className="flex justify-between"><span>{priceCalculation.registrationLabel === 'Faculty (Early Bird)' ? 'Faculty (Early Bird — TAS Member rate)' : 'Faculty Registration (TAS Member rate)'}:</span><span className="font-medium">₹{baseFee.toLocaleString('en-IN')}</span></div>
                        {accompanyingFee > 0 && (
                          <div className="flex justify-between">
                            <span>Accompanying Persons ({priceCalculation.accompanyingPersonCount || formData.accompanyingPersons.length}):</span>
                            <span className="font-medium">₹{accompanyingFee.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {priceCalculation.freeChildrenCount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Children under 10 ({priceCalculation.freeChildrenCount}):</span>
                            <span className="font-medium">FREE</span>
                          </div>
                        )}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-bold text-lg"><span>Total (incl. GST):</span><span className="text-[#002552]">₹{totalAmount.toLocaleString('en-IN')}</span></div>
                          <p className="text-xs text-gray-500 mt-1">All prices are inclusive of GST.</p>
                        </div>
                      </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Calculating pricing...</div>
                      )}
                    </div>

                    {/* Secure gateway note */}
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-blue-800">
                        You'll be redirected to our secure payment gateway (Razorpay). Your registration is created automatically once payment succeeds, and a confirmation email is sent.
                      </p>
                    </div>

                    <div className="flex gap-3 justify-between pt-4 border-t">
                      <Button type="button" variant="outline" onClick={() => { setStep(1); window.scrollTo(0, 0) }} disabled={isLoading}>← Back to Details</Button>
                      <Button type="button" onClick={handlePayNow} className="bg-[#002552] hover:bg-[#001B3D] py-6 text-lg px-8" disabled={isLoading || !priceCalculation || totalAmount <= 0}>
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5 mr-2" />Pay ₹{totalAmount.toLocaleString('en-IN')} &amp; Register</>}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )}

            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}
