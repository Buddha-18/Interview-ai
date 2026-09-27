import {getInterviewReportById,getAllInterviewReports,generateInterviewReport,generateResumePdf} from "../services/interview.api"
import {InterviewContext} from "../interview.context"
import {useCallback, useContext,useEffect} from "react"
import {useParams} from "react-router"


export const useInterview = () =>{
    const context = useContext(InterviewContext)
    const {interviewId} = useParams()

    if(!context){
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const {loading, setLoading, report, setReport, reports, setReports} = context

    const generateReport = async({resumeFile, selfDescription, jobDescription})=>{
        setLoading(true)
        try{
            const response = await generateInterviewReport({resumeFile, selfDescription, jobDescription})
            setReport(response.interviewReport)
            return response.interviewReport
        }catch(err){
            console.error("Failed to generate interview report:", err)
            return null
        }finally{
            setLoading(false)
        }
    }

    const getReportById = useCallback(async(interviewId)=>{
        setLoading(true)
        try{
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        }catch(err){
            console.error("Failed to fetch interview report:", err)
            return null
        }finally{
            setLoading(false)
        }
    }, [setLoading, setReport])

    const getReports = async()=>{
        setLoading(true)
        try{
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        }catch(err){
            console.error("Failed to fetch interview reports:", err)
            return null
        }finally{
            setLoading(false)
        }
    }

    const getResumePdf = async(interviewReportId)=>{
        setLoading(true)
        let response = null
        try{
            const response = await generateResumePdf(interviewReportId)
            const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `resume_${interviewReportId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        }catch(err){
            console.error("Failed to generate resume pdf:", err)
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        if(interviewId){
            getReportById(interviewId)
        }else{
            getReports()
        }
    },[interviewId])

    return {loading, report,  reports, generateReport, getReportById, getReports, getResumePdf}
}