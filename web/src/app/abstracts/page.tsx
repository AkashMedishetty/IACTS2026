"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { useSession, signIn } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Checkbox } from "../../components/ui/checkbox"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Navigation } from "../../components/Navigation"
import { Calendar, FileText, Award, Upload, CheckCircle, Bell, Mail, Lock, LogIn, Clock, AlertCircle, UserPlus, User, MapPin, Stethoscope, ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, X, Download } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { conferenceConfig } from "../../config/conference.config"
import { upload } from "@vercel/blob/client"

// Constants
const SUBMISSION_CATEGORY_OPTIONS = [
  { value: 'free-paper', label: 'Free Paper' },
  { value: 'poster-presentation', label: 'Poster Presentation' }
]

const TITLES = ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.']
const DESIGNATIONS = ['Consultant', 'PG/Student']

type FlowType = 'none' | 'registered' | 'unregistered'

// ============ LOGIN MODAL COMPONENT ============
interface LoginModalProps {
  show: boolean
  onClose: () => void
  onSuccess: () => void
}

const LoginModal = memo(function LoginModal({ show, onClose, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.ok) {
        toast.success("Login successful!")
        onSuccess()
      } else {
        toast.error(result?.error || "Invalid email or password")
      }
    } catch {
      toast.error("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#002552]" />
              Login to Submit
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email Address</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-[#002552] hover:bg-[#002552]" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login & Continue
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            <Link href="/auth/forgot-password" className="text-[#002552] hover:underline">
              Forgot password?
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

// ============ REGISTERED ABSTRACT FORM COMPONENT ============
interface RegisteredFormProps {
  session: any
  onClose: () => void
  onSuccess: (data: any) => void
  abstractsConfig: any
}

const RegisteredAbstractForm = memo(function RegisteredAbstractForm({ session, onClose, onSuccess, abstractsConfig }: RegisteredFormProps) {
  const [formData, setFormData] = useState({
    email: session?.user?.email || "",
    mobile: "",
    submissionCategory: "",
    presenterCategory: "",
    title: "",
    authors: "",
    abstract: "",
    keywords: "",
    file: null as File | null
  })
  const [isLoading, setIsLoading] = useState(false)

  const PRESENTER_CATEGORY_OPTIONS = [
    { value: 'Postgraduate', label: 'Postgraduate' },
    { value: 'Junior Consultant / Fellow', label: 'Junior Consultant / Fellow (≤ 5 yrs since PG)' },
    { value: 'Senior Consultant', label: 'Senior Consultant' },
  ]

  // Dynamic options from config
  const submissionCategoryOptions = abstractsConfig?.submissionCategories?.filter((o: any) => o.enabled && o.key !== 'award-paper')?.map((o: any) => ({ value: o.key, label: o.label })) || SUBMISSION_CATEGORY_OPTIONS
  const wordLimit = abstractsConfig?.guidelines?.freePaper?.wordLimit || abstractsConfig?.guidelines?.poster?.wordLimit || 250
  const maxFileSizeMB = abstractsConfig?.maxFileSizeMB || 4

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ['.doc', '.docx']
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!allowedTypes.includes(ext)) {
        toast.error("Please upload a Word document (.doc or .docx)")
        return
      }
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        toast.error(`File size must not exceed ${maxFileSizeMB}MB`)
        return
      }
      setFormData(prev => ({ ...prev, file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email (the one used for registration)')
      return
    }
    if (!/^[0-9]{10}$/.test(formData.mobile.replace(/\D/g, '').slice(-10))) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }
    if (!formData.submissionCategory) {
      toast.error('Please select a submission category')
      return
    }
    if (formData.submissionCategory === 'free-paper' && !formData.presenterCategory) {
      toast.error('Please select your category (Postgraduate / Junior Consultant / Fellow / Senior Consultant)')
      return
    }
    if (!formData.title.trim() || !formData.authors.trim()) {
      toast.error('Please enter title and authors')
      return
    }
    if (!formData.file) {
      toast.error('Please upload an abstract file')
      return
    }

    setIsLoading(true)
    try {
      toast.info("Uploading file...")
      const blob = await upload(formData.file.name, formData.file, {
        access: 'public',
        handleUploadUrl: '/api/abstracts/upload',
        clientPayload: JSON.stringify({ email: formData.email })
      })

      toast.info("Submitting abstract...")
      const response = await fetch('/api/abstracts/submit-verified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          blobUrl: blob.url,
          fileName: formData.file.name,
          fileSize: formData.file.size,
          fileType: formData.file.type
        })
      })
      
      const data = await response.json()
      if (data.success) {
        toast.success("Abstract submitted successfully!")
        onSuccess(data.data)
      } else {
        toast.error(data.message || "Submission failed")
      }
    } catch (err) {
      // Surface the real error (e.g. Vercel Blob upload failures) instead of a generic message
      const msg = (err as Error)?.message || 'Submission failed. Please try again.'
      console.error('[abstract-submit] error:', err)
      toast.error(`Upload/submit failed: ${msg}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
      <Card className="bg-white dark:bg-gray-800 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#002552]" />
              Submit Your Abstract
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Identify yourself with the <strong>email &amp; mobile number</strong> from your conference registration.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#002552]/5 border border-[#002552]/15">
              <div>
                <Label>Registered Email <span className="text-red-500">*</span></Label>
                <Input type="email" placeholder="email used during registration" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>Mobile Number <span className="text-red-500">*</span></Label>
                <Input type="tel" inputMode="numeric" placeholder="10-digit mobile number" value={formData.mobile} onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))} className="mt-1" />
                <p className="text-xs text-gray-500 mt-1">Use the email &amp; mobile from your conference registration.</p>
              </div>
            </div>

            <div>
              <Label>Submission Category <span className="text-red-500">*</span></Label>
              <Select value={formData.submissionCategory} onValueChange={(v) => setFormData(prev => ({ ...prev, submissionCategory: v, presenterCategory: '' }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {submissionCategoryOptions.map((opt: any) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {formData.submissionCategory === 'free-paper' && (
              <div>
                <Label>Category <span className="text-red-500">*</span></Label>
                <Select value={formData.presenterCategory} onValueChange={(v) => setFormData(prev => ({ ...prev, presenterCategory: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select your category" /></SelectTrigger>
                  <SelectContent>
                    {PRESENTER_CATEGORY_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Free Paper categories — Postgraduate, Junior Consultant / Fellow (≤ 5 yrs), Senior Consultant.</p>
              </div>
            )}

            <div>
              <Label>Abstract Title <span className="text-red-500">*</span></Label>
              <Input placeholder="Enter your abstract title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} className="mt-1" />
            </div>
            
            <div>
              <Label>Authors <span className="text-red-500">*</span></Label>
              <Input placeholder="Author 1, Author 2 (comma separated)" value={formData.authors} onChange={(e) => setFormData(prev => ({ ...prev, authors: e.target.value }))} className="mt-1" />
            </div>
            
            <div>
              <Label>Abstract Content (Optional)</Label>
              <Textarea placeholder={`Enter abstract content (max ${wordLimit} words)`} value={formData.abstract} onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))} className="mt-1 min-h-[120px]" />
            </div>
            
            <div>
              <Label>Keywords (Optional)</Label>
              <Input placeholder="keyword1, keyword2" value={formData.keywords} onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))} className="mt-1" />
            </div>
            
            <div>
              <Label>Abstract File <span className="text-red-500">*</span></Label>
              <div className="mt-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#002552] transition-colors">
                <input type="file" id="registered-file" accept=".doc,.docx" onChange={handleFileChange} className="hidden" />
                <label htmlFor="registered-file" className="cursor-pointer">
                  <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                  {formData.file ? (
                    <div>
                      <p className="text-sm font-medium text-green-600">{formData.file.name}</p>
                      <p className="text-xs text-gray-500">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload</p>
                      <p className="text-xs text-gray-500">Word (.doc, .docx) only - Max {maxFileSizeMB}MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-[#002552] hover:bg-[#002552]" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4 mr-2" />Submit Abstract</>}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
})


// ============ UNREGISTERED FORM COMPONENT ============
interface UnregisteredFormProps {
  registrationTypes: Array<{ value: string; label: string; price: number }>
  onClose: () => void
  onSuccess: (data: any) => void
  abstractsConfig: any
}

const UnregisteredForm = memo(function UnregisteredForm({ registrationTypes, onClose, onSuccess, abstractsConfig }: UnregisteredFormProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const [formData, setFormData] = useState({
    title: 'Dr.', firstName: '', lastName: '', email: '', phone: '', age: '',
    designation: 'Consultant', password: '', confirmPassword: '', institution: '',
    mciNumber: '', address: '', city: '', state: '', country: 'India', pincode: '',
    registrationType: '', dietaryRequirements: '', specialNeeds: '',
    submissionCategory: '', abstractTitle: '', authors: '',
    abstractContent: '', keywords: '', agreeTerms: false
  })

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimeout) clearTimeout(emailCheckTimeout)
    }
  }, [emailCheckTimeout])

  const checkEmailUniqueness = useCallback(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    setIsCheckingEmail(true)
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      if (response.ok) {
        const result = await response.json()
        setEmailAvailable(result.available)
        if (!result.available) toast.error('This email is already registered. Please use a different email or sign in.')
      }
    } catch { /* ignore */ } finally { setIsCheckingEmail(false) }
  }, [])

  // Handle email change with debounced check
  const handleEmailChange = useCallback((email: string) => {
    setFormData(prev => ({ ...prev, email: email.toLowerCase() }))
    setEmailAvailable(null)
    
    // Clear existing timeout
    if (emailCheckTimeout) clearTimeout(emailCheckTimeout)
    
    // Set new debounced check
    if (email.includes('@') && email.includes('.')) {
      const timeoutId = setTimeout(() => checkEmailUniqueness(email), 1000)
      setEmailCheckTimeout(timeoutId)
    }
  }, [emailCheckTimeout, checkEmailUniqueness])

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const wordLimit = abstractsConfig?.guidelines?.freePaper?.wordLimit || abstractsConfig?.guidelines?.poster?.wordLimit || 250
  const maxFileSizeMB = abstractsConfig?.maxFileSizeMB || 4
  const submissionCategoryOptions = abstractsConfig?.submissionCategories?.filter((o: any) => o.enabled && o.key !== 'award-paper')?.map((o: any) => ({ value: o.key, label: o.label })) || SUBMISSION_CATEGORY_OPTIONS

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase()
      if (!['.doc', '.docx'].includes(ext)) {
        toast.error("Please upload a Word document (.doc or .docx)")
        return
      }
      if (f.size > maxFileSizeMB * 1024 * 1024) {
        toast.error(`File size must not exceed ${maxFileSizeMB}MB`)
        return
      }
      setFile(f)
    }
  }

  const validateStep = (s: number): boolean => {
    const errors: Record<string, string> = {}
    let hasErrors = false
    
    if (s === 1) {
      if (!formData.firstName.trim()) { errors.firstName = 'Required'; hasErrors = true }
      if (!formData.lastName.trim()) { errors.lastName = 'Required'; hasErrors = true }
      if (!formData.age.trim()) { errors.age = 'Required'; hasErrors = true }
      if (!formData.email.trim()) { errors.email = 'Required'; hasErrors = true }
      else if (emailAvailable === false) { errors.email = 'Already registered'; hasErrors = true }
      if (!formData.phone.trim() || !/^[0-9]{10}$/.test(formData.phone)) { errors.phone = '10 digits required'; hasErrors = true }
      if (!formData.institution.trim()) { errors.institution = 'Required'; hasErrors = true }
      if (!formData.mciNumber.trim()) { errors.mciNumber = 'Required'; hasErrors = true }
      if (!formData.password || formData.password.length < 8) { errors.password = 'Min 8 chars'; hasErrors = true }
      if (formData.password !== formData.confirmPassword) { errors.confirmPassword = 'No match'; hasErrors = true }
    } else if (s === 2) {
      if (!formData.city.trim()) { errors.city = 'Required'; hasErrors = true }
      if (!formData.state.trim()) { errors.state = 'Required'; hasErrors = true }
      if (!formData.registrationType) { errors.registrationType = 'Required'; hasErrors = true }
    } else if (s === 3) {
      if (!formData.submissionCategory) { errors.submissionCategory = 'Required'; hasErrors = true }
      if (!formData.abstractTitle.trim()) { errors.abstractTitle = 'Required'; hasErrors = true }
      if (!formData.authors.trim()) { errors.authors = 'Required'; hasErrors = true }
      if (!file) { errors.file = 'Required'; hasErrors = true }
      if (!formData.agreeTerms) { errors.agreeTerms = 'Required'; hasErrors = true }
    }
    
    setFieldErrors(errors)
    if (hasErrors) toast.error('Please fill all required fields')
    return !hasErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(3)) return

    setIsLoading(true)
    try {
      let blobUrl = '', fileName = '', fileSize = 0, fileType = ''
      if (file) {
        toast.info('Uploading file...')
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/abstracts/upload',
          clientPayload: JSON.stringify({ registrationId: '' })
        })
        blobUrl = blob.url
        fileName = file.name
        fileSize = file.size
        fileType = file.type
      }

      toast.info('Submitting registration...')
      const res = await fetch('/api/abstracts/submit-unregistered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, blobUrl, fileName, fileSize, fileType })
      })
      
      const data = await res.json()
      if (data.success) {
        toast.success('Registration and abstract submitted!')
        onSuccess({ registrationId: data.registrationId, abstractId: data.abstractId })
      } else {
        toast.error(data.message || 'Submission failed')
      }
    } catch {
      toast.error('Submission failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { label: "Personal Info", icon: User },
    { label: "Address", icon: MapPin },
    { label: "Abstract", icon: FileText },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
      <Card className="bg-white dark:bg-gray-800 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#C98500]" />
              Register & Submit Abstract
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
          
          {/* Step Progress */}
          <div className="flex items-center justify-between mt-4">
            {steps.map((s, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  step > idx + 1 ? 'bg-green-500 border-green-500 text-white' :
                  step === idx + 1 ? 'bg-[#002552] border-[#002552] text-white' :
                  'border-gray-300 text-gray-400'
                }`}>
                  {step > idx + 1 ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={`ml-2 text-sm hidden sm:inline ${step === idx + 1 ? 'font-semibold' : 'text-gray-500'}`}>{s.label}</span>
                {idx < steps.length - 1 && <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > idx + 1 ? 'bg-green-500' : 'bg-gray-300'}`} />}
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Select value={formData.title} onValueChange={(v) => updateField('title', v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{TITLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Label>First Name <span className="text-red-500">*</span></Label>
                    <Input value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} placeholder="First name" className={`mt-1 ${fieldErrors.firstName ? 'border-red-500' : ''}`} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Last Name <span className="text-red-500">*</span></Label>
                    <Input value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} placeholder="Last name" className={`mt-1 ${fieldErrors.lastName ? 'border-red-500' : ''}`} />
                  </div>
                  <div>
                    <Label>Age <span className="text-red-500">*</span></Label>
                    <Input type="number" value={formData.age} onChange={(e) => updateField('age', e.target.value)} placeholder="Age" min="18" max="100" className={`mt-1 ${fieldErrors.age ? 'border-red-500' : ''}`} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email <span className="text-red-500">*</span></Label>
                    <div className="relative mt-1">
                      <Input type="email" value={formData.email} onChange={(e) => handleEmailChange(e.target.value)} placeholder="your.email@example.com" className={`pr-10 ${emailAvailable === false ? 'border-red-500' : emailAvailable === true ? 'border-green-500' : ''}`} />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isCheckingEmail && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                        {!isCheckingEmail && emailAvailable === true && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {!isCheckingEmail && emailAvailable === false && <AlertCircle className="w-4 h-4 text-red-500" />}
                      </div>
                    </div>
                    {emailAvailable === false && <p className="text-xs text-red-500 mt-1">This email is already registered</p>}
                    {emailAvailable === true && <p className="text-xs text-green-500 mt-1">Email is available</p>}
                  </div>
                  <div>
                    <Label>Phone <span className="text-red-500">*</span></Label>
                    <Input value={formData.phone} onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile" maxLength={10} className={`mt-1 ${fieldErrors.phone ? 'border-red-500' : ''}`} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Designation</Label>
                    <Select value={formData.designation} onValueChange={(v) => updateField('designation', v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>MCI/NMC Number <span className="text-red-500">*</span></Label>
                    <Input value={formData.mciNumber} onChange={(e) => updateField('mciNumber', e.target.value)} placeholder="Registration number" className={`mt-1 ${fieldErrors.mciNumber ? 'border-red-500' : ''}`} />
                  </div>
                </div>
                
                <div>
                  <Label>Institution/Hospital <span className="text-red-500">*</span></Label>
                  <Input value={formData.institution} onChange={(e) => updateField('institution', e.target.value)} placeholder="Your institution" className={`mt-1 ${fieldErrors.institution ? 'border-red-500' : ''}`} />
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2"><Lock className="w-4 h-4" /> Create Password</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Password <span className="text-red-500">*</span></Label>
                      <div className="relative mt-1">
                        <Input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => updateField('password', e.target.value)} placeholder="Min 8 characters" className={`pr-10 ${fieldErrors.password ? 'border-red-500' : ''}`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label>Confirm Password <span className="text-red-500">*</span></Label>
                      <div className="relative mt-1">
                        <Input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} placeholder="Re-enter password" className={`pr-10 ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Step 2: Address & Registration */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Address</Label>
                  <Input value={formData.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Street address" className="mt-1" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City <span className="text-red-500">*</span></Label>
                    <Input value={formData.city} onChange={(e) => updateField('city', e.target.value)} placeholder="City" className={`mt-1 ${fieldErrors.city ? 'border-red-500' : ''}`} />
                  </div>
                  <div>
                    <Label>State <span className="text-red-500">*</span></Label>
                    <Input value={formData.state} onChange={(e) => updateField('state', e.target.value)} placeholder="State" className={`mt-1 ${fieldErrors.state ? 'border-red-500' : ''}`} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Country</Label>
                    <Input value={formData.country} onChange={(e) => updateField('country', e.target.value)} placeholder="Country" className="mt-1" />
                  </div>
                  <div>
                    <Label>Pincode</Label>
                    <Input value={formData.pincode} onChange={(e) => updateField('pincode', e.target.value)} placeholder="Pincode" className="mt-1" />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2"><Stethoscope className="w-4 h-4" /> Registration Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Registration Type <span className="text-red-500">*</span></Label>
                      <Select value={formData.registrationType} onValueChange={(v) => updateField('registrationType', v)}>
                        <SelectTrigger className={`mt-1 ${fieldErrors.registrationType ? 'border-red-500' : ''}`}><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>{registrationTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Dietary Requirements</Label>
                      <Select value={formData.dietaryRequirements} onValueChange={(v) => updateField('dietaryRequirements', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select if any" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                          <SelectItem value="halal">Halal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Abstract Details */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>Submission Category <span className="text-red-500">*</span></Label>
                  <Select value={formData.submissionCategory} onValueChange={(v) => updateField('submissionCategory', v)}>
                    <SelectTrigger className={`mt-1 ${fieldErrors.submissionCategory ? 'border-red-500' : ''}`}><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{submissionCategoryOptions.map((opt: any) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Abstract Title <span className="text-red-500">*</span></Label>
                  <Input value={formData.abstractTitle} onChange={(e) => updateField('abstractTitle', e.target.value)} placeholder="Enter your abstract title" className={`mt-1 ${fieldErrors.abstractTitle ? 'border-red-500' : ''}`} />
                </div>
                
                <div>
                  <Label>Authors <span className="text-red-500">*</span></Label>
                  <Input value={formData.authors} onChange={(e) => updateField('authors', e.target.value)} placeholder="Author 1, Author 2 (comma separated)" className={`mt-1 ${fieldErrors.authors ? 'border-red-500' : ''}`} />
                </div>
                
                <div>
                  <Label>Abstract Content (Optional)</Label>
                  <Textarea value={formData.abstractContent} onChange={(e) => updateField('abstractContent', e.target.value)} placeholder={`Enter abstract content (max ${wordLimit} words)`} rows={4} className="mt-1" />
                </div>
                
                <div>
                  <Label>Keywords (Optional)</Label>
                  <Input value={formData.keywords} onChange={(e) => updateField('keywords', e.target.value)} placeholder="keyword1, keyword2" className="mt-1" />
                </div>
                
                <div>
                  <Label>Upload Abstract <span className="text-red-500">*</span></Label>
                  <div className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center hover:border-[#002552] transition-colors ${fieldErrors.file ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                    <input type="file" id="unregistered-file" accept=".doc,.docx" onChange={handleFileChange} className="hidden" />
                    <label htmlFor="unregistered-file" className="cursor-pointer">
                      <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                      {file ? (
                        <div>
                          <p className="text-sm font-medium text-green-600">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload</p>
                          <p className="text-xs text-gray-500">Word (.doc, .docx) only - Max {maxFileSizeMB}MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 pt-4 border-t">
                  <Checkbox id="terms" checked={formData.agreeTerms} onCheckedChange={(checked) => updateField('agreeTerms', checked as boolean)} />
                  <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    I agree to the <Link href="/terms-conditions" className="text-[#002552] hover:underline" target="_blank">Terms</Link> and <Link href="/privacy-policy" className="text-[#002552] hover:underline" target="_blank">Privacy Policy</Link>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6 mt-6 border-t">
              {step > 1 && <Button type="button" variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>}
              <div className="flex-1" />
              {step < 3 ? (
                <Button type="button" onClick={() => { if (validateStep(step)) { setStep(step + 1); toast.success(`Step ${step} completed!`) } }} className="bg-[#002552] hover:bg-[#002552]">
                  Next<ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-2" />Submit</>}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
})


// ============ MAIN PAGE COMPONENT ============
export default function AbstractsPage() {
  const { data: session } = useSession()
  
  // Config state
  const [abstractsConfig, setAbstractsConfig] = useState<any>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [registrationTypes, setRegistrationTypes] = useState<Array<{ value: string; label: string; price: number }>>([])

  // Flow state
  const [activeFlow, setActiveFlow] = useState<FlowType>('none')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionData, setSubmissionData] = useState<any>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pendingFinal, setPendingFinal] = useState(false)

  // Reminder state
  const [reminderEmail, setReminderEmail] = useState("")
  const [reminderLoading, setReminderLoading] = useState(false)

  useEffect(() => {
    document.title = `Abstract Submission | ${conferenceConfig.shortName}`
  }, [])

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/abstracts/config')
        const data = await response.json()
        if (data.success) setAbstractsConfig(data.data)
        
        const typesResponse = await fetch('/api/admin/registration-types')
        if (typesResponse.ok) {
          const typesResult = await typesResponse.json()
          if (typesResult.success && typesResult.data?.length > 0) {
            setRegistrationTypes(typesResult.data.map((type: any) => ({ value: type.key, label: type.label, price: type.price })))
          } else {
            setRegistrationTypes(conferenceConfig.registration.categories.map(cat => ({ value: cat.key, label: cat.label, price: 0 })))
          }
        }
      } catch { /* ignore */ } finally { setConfigLoading(false) }
    }
    fetchConfig()
  }, [])

  useEffect(() => {
    if (session && activeFlow === 'registered') {
      setIsAuthenticated(true)
      setShowLoginModal(false)
    }
  }, [session, activeFlow])

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true)
    setShowLoginModal(false)
    if (pendingFinal) {
      window.location.href = '/dashboard/abstracts'
    }
  }, [pendingFinal])

  // Public final-submission entry: visible to everyone; authenticate on click,
  // then route to the dashboard where accepted authors upload their final file.
  const handleFinalSubmission = useCallback(() => {
    if (session) {
      window.location.href = '/dashboard/abstracts'
    } else {
      setPendingFinal(true)
      setShowLoginModal(true)
    }
  }, [session])

  const handleFormSuccess = useCallback((data: any) => {
    setSubmissionData(data)
    setIsSubmitted(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setActiveFlow('none')
  }, [])

  const resetAll = useCallback(() => {
    setActiveFlow('none')
    setIsSubmitted(false)
    setSubmissionData(null)
    setIsAuthenticated(false)
    setShowLoginModal(false)
  }, [])

  const handleReminderSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reminderEmail.trim() || !reminderEmail.includes('@')) {
      toast.error('Please enter a valid email')
      return
    }
    setReminderLoading(true)
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: reminderEmail, type: 'abstract-reminder' })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('We\'ll notify you when submissions open!')
        setReminderEmail('')
      } else {
        toast.error(data.message || 'Failed to subscribe')
      }
    } catch { toast.error('An error occurred') } finally { setReminderLoading(false) }
  }

  const submissionsDisabled = !configLoading && abstractsConfig && !abstractsConfig.submissionWindow?.enabled

  // Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center p-8 lg:p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {activeFlow === 'unregistered' ? 'Registration & Abstract Submitted!' : 'Abstract Submitted Successfully!'}
          </h2>
          
          {submissionData && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="text-sm text-green-700 dark:text-green-300 space-y-1 text-left">
                {submissionData.registrationId && <p><strong>Registration ID:</strong> {submissionData.registrationId}</p>}
                <p><strong>Abstract ID:</strong> {submissionData.abstractId}</p>
              </div>
            </div>
          )}
          
          {activeFlow === 'unregistered' && (
            <Alert className="mb-6 text-left bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Payment Pending:</strong> Login with your email and password to complete payment.
              </AlertDescription>
            </Alert>
          )}
          
          <p className="text-gray-600 dark:text-gray-300 mb-2">Your abstract will be reviewed by our scientific committee.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">ðŸ“§ A confirmation email has been sent.</p>
          
          <div className="flex flex-col gap-3">
            {activeFlow === 'unregistered' ? (
              <Link href="/login" className="w-full"><Button className="w-full bg-green-600 hover:bg-green-700"><LogIn className="w-4 h-4 mr-2" />Login to Check Status & Pay</Button></Link>
            ) : (
              <Link href="/dashboard/abstracts" className="w-full"><Button className="w-full bg-green-600 hover:bg-green-700"><FileText className="w-4 h-4 mr-2" />View My Abstracts</Button></Link>
            )}
            <div className="flex gap-3">
              <Button onClick={resetAll} variant="outline" className="flex-1">Submit Another</Button>
              <Link href="/" className="flex-1"><Button variant="outline" className="w-full">Go Home</Button></Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <LoginModal show={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={handleLoginSuccess} />

      <div className="pt-24 pb-12">
        {/* Prize highlight — sits in the white gap above the header */}
        {activeFlow === 'none' && !submissionsDisabled && (
          <section className="container mx-auto px-4 pt-2 pb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <div className="rounded-2xl bg-gradient-to-r from-[#E0A52A] to-[#C98500] text-[#2A1C00] shadow-xl px-6 py-5 text-center border border-[#C98500]/60">
                <p className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center justify-center gap-2">
                  <Award className="w-6 h-6" />
                  Exciting Prizes for the Winners!
                </p>
                <p className="text-base md:text-lg font-bold mt-1">
                  Don&apos;t miss your chance to shine at {conferenceConfig.shortName}
                </p>
              </div>
            </motion.div>
          </section>
        )}

        {/* Header */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-[#002552] to-[#001B3D] text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">Abstract Submission</h1>
              
              <div className="mb-6">
                <motion.div className={`inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full mb-4 ${submissionsDisabled ? 'bg-orange-500/30' : ''}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
                  {submissionsDisabled ? <><Clock className="w-5 h-5 mr-2" /><span className="font-semibold">Coming Soon</span></> : <><CheckCircle className="w-5 h-5 mr-2" /><span className="font-semibold">Now Open</span></>}
                </motion.div>
                
                <p className="text-lg md:text-xl max-w-3xl mx-auto">
                  Submit your research abstracts for Free Paper and Poster Presentation
                  <br /><span className="text-blue-200">at {conferenceConfig.shortName}, {conferenceConfig.venue.city}</span>
                </p>
              </div>

              {/* Final Submission — accepted authors upload their final paper / presentation */}
              {activeFlow === 'none' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 flex flex-col items-center gap-2">
                  <p className="text-white/70 text-sm">Abstract accepted? Upload your final paper / presentation.</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={handleFinalSubmission} className="px-8 py-6 text-lg bg-[#C98500] hover:bg-[#E0A52A] text-[#002552] rounded-2xl shadow-2xl font-bold">
                      <CheckCircle className="w-5 h-5 mr-2" />Final Submission
                    </Button>
                  </motion.div>

                  {session && (
                    <Link href="/dashboard/abstracts" className="mt-2"><Button variant="link" className="text-white/80 hover:text-white"><FileText className="w-4 h-4 mr-2" />View My Submitted Abstracts</Button></Link>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>


        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {activeFlow === 'registered' && (
              <RegisteredAbstractForm session={session} onClose={handleCloseForm} onSuccess={handleFormSuccess} abstractsConfig={abstractsConfig} />
            )}

            {false && (
              <div className="max-w-md mx-auto text-center">
                <Card className="bg-white dark:bg-gray-800 shadow-xl">
                  <CardContent className="pt-6">
                    <Lock className="w-12 h-12 mx-auto mb-4 text-[#002552]" />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Login Required</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Please login to submit your abstract</p>
                    <Button onClick={() => setShowLoginModal(true)} className="w-full bg-[#002552] hover:bg-[#002552]"><LogIn className="w-4 h-4 mr-2" />Login Now</Button>
                    <Button variant="link" onClick={() => setActiveFlow('none')} className="mt-2">Go Back</Button>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeFlow === 'unregistered' && (
              <UnregisteredForm registrationTypes={registrationTypes} onClose={handleCloseForm} onSuccess={handleFormSuccess} abstractsConfig={abstractsConfig} />
            )}
            
            {activeFlow === 'none' && submissionsDisabled && (
              <div className="max-w-xl mx-auto">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="pt-6">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-[#002552]" />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 text-center">Get Notified When Submissions Open</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">Enter your email to receive a notification</p>
                    <form onSubmit={handleReminderSignup} className="flex flex-col sm:flex-row gap-3">
                      <Input type="email" placeholder="your.email@example.com" value={reminderEmail} onChange={(e) => setReminderEmail(e.target.value)} className="flex-1" required />
                      <Button type="submit" disabled={reminderLoading} className="bg-[#002552] hover:bg-[#002552]">
                        {reminderLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4 mr-2" />Notify Me</>}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeFlow === 'none' && !submissionsDisabled && (
              <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white">Abstract Submission Guidelines</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                    Abstracts are invited for Free Paper Presentation and Poster Presentation at TASCON 2026, Hyderabad.
                  </p>
                </motion.div>

                {/* Important Dates */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
                  <Card className="bg-gradient-to-r from-[#002552] to-[#001B3D] text-white border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-8 h-8" />
                          <div><h3 className="text-xl font-bold">Important Dates</h3><p className="text-white/80">Mark your calendar!</p></div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 text-center">
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <p className="text-sm text-white/80">Last Date to Submit <span className="text-yellow-300">(Extended)</span></p>
                            <p className="font-bold text-yellow-300">5 July 2026</p>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <p className="text-sm text-white/80">Acceptance Notification</p>
                            <p className="font-bold text-green-300">By 10 July 2026</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Categories */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
                  <Card className="bg-white dark:bg-gray-800 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-[#002552]" />Presentation Categories</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { t: 'Postgraduate', d: 'PG students — given priority' },
                          { t: 'Junior Consultant / Fellow', d: '≤ 5 years since post-graduation' },
                          { t: 'Senior Consultant', d: 'More than 5 years since post-graduation' },
                        ].map((c, i) => (
                          <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{c.t}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{c.d}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm font-semibold text-[#002552] dark:text-[#E0A52A] mt-4">There will be exciting prizes in all categories!</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Presentation Templates — public download */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
                  <Card className="bg-gradient-to-r from-[#25406b] to-[#152843] text-white border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Download className="w-8 h-8 text-[#E0A52A] flex-shrink-0" />
                          <div>
                            <h3 className="text-xl font-bold">Presentation Templates</h3>
                            <p className="text-white/80 text-sm">Download the official templates and prepare your paper / poster.</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <a href="/templates/paper-template.pptx" download className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#25406b] font-bold text-sm hover:bg-[#FFF6E4] transition-colors">
                            <FileText className="w-4 h-4" /> Paper Template
                          </a>
                          <a href="/templates/poster-template.pptx" download className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#C98500] text-[#25406b] font-bold text-sm hover:bg-[#E0A52A] transition-colors">
                            <FileText className="w-4 h-4" /> Poster Template
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Quick Rules */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2"><FileText className="w-5 h-5" />Quick Submission Rules</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          'Max 150 words',
                          '12pt Arial, double spacing',
                          'Word format only (.doc/.docx)',
                          'No images, tables or graphs',
                        ].map((rule, i) => (
                          <div key={i} className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span className="text-sm">{rule}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Free Paper & Poster Guidelines */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
                  <Card className="bg-white dark:bg-gray-800 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <FileText className="w-6 h-6 mr-3 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">Guidelines for Free Paper &amp; Poster</h3>
                          <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-2 list-disc pl-5">
                            <li>The abstract must not exceed <strong>150 words</strong> and should be in <strong>12pt Arial font with double spacing</strong>.</li>
                            <li>The title of the abstract must be concise; avoid using abbreviations.</li>
                            <li>Do not include personal details. <strong>Only the email ID</strong> is to be submitted for further correspondence.</li>
                            <li>The abstract should include <strong>Aim, Methods, Results and Conclusion</strong>.</li>
                            <li>Do not include images, tables or graphs in the abstract.</li>
                            <li>The first author will be considered as the presenting author.</li>
                            <li>One author can present only one oral presentation; a poster presentation can be additional.</li>
                            <li>Poster abstracts must follow the same formatting and word-count guidelines as Free Papers. Please explicitly indicate at the top of your submission whether it is for <strong>&apos;Free Paper Only&apos;</strong>, <strong>&apos;Poster Only&apos;</strong>, or <strong>&apos;Either&apos;</strong>.</li>
                            <li>Abstracts must be submitted online via the conference website in <strong>Microsoft Word (.doc or .docx)</strong> format only. PDF submissions will not be accepted.</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Important Notice */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <AlertCircle className="w-6 h-6 mr-3 text-red-600 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-3">Important Notice</h3>
                          <ul className="text-red-700 dark:text-red-300 space-y-2 text-sm">
                            <li>&bull; Conference registration is mandatory to present a Free Paper / Poster.</li>
                            <li>&bull; Postgraduate students must submit their HOD&apos;s letter.</li>
                            <li>&bull; The Scientific Committee reserves the right to accept/reject any paper without assigning any reason.</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* CTA */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-10">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <Button onClick={() => { setActiveFlow('registered'); if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="px-10 py-6 text-lg bg-[#002552] hover:bg-[#002552] text-white rounded-full shadow-xl font-bold">
                      <Upload className="w-5 h-5 mr-2" />Submit Your Abstract
                    </Button>
                    
                    {!session && abstractsConfig?.enableAbstractsWithoutRegistration && (
                      <Button onClick={() => setActiveFlow('unregistered')} variant="outline" className="px-10 py-6 text-lg border-[#E0A52A] text-[#C98500] hover:bg-[#E0A52A]/10 rounded-full shadow-xl font-bold">
                        <UserPlus className="w-5 h-5 mr-2" />Register & Submit
                      </Button>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
