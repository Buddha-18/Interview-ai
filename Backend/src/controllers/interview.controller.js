const pdfParse = require("pdf-parse")
const {generateInterviewReport,gererateResumePdf} = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * @description Controller to generate interview report based on user self description, resume pdf and job description
 * @route POST /api/interview
 * @access private
 */
async function generateInterviewReportController(req,res) {
    const resumeFile = req.file

    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const {selfDescription,jobDescription} = req.body

    const interViewReportByAi = await generateInterviewReport({
        selfDescription,
        resume: resumeContent.text,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })

    res.status(201).json({
        message:"Interview report generated successfully",
        interviewReport
    })

}
/**
 * @description Controller to get interview report by id
 * @route GET /api/interview/report/:interviewId
 * @access private
 */
async function getInterviewReportByIdController(req,res) {  
    const {interviewId} = req.params
    const interviewReport = await interviewReportModel.findOne({_id:interviewId,user:req.user.id})
    if(!interviewReport){
        return res.status(404).json({
            message:"Interview report not found"
        })
    }
    res.status(200).json({
        message:"Interview report fetched successfully",
        interviewReport })
}

/**
 * @description Controller to get all interview reports of user
 * @route GET /api/interview
 * @access private
 */

async function getAllInterviewReportsController(req,res) {
    const interviewReports = await interviewReportModel.find({user:req.user.id}).sort({createdAt:-1}).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")
    res.status(200).json({ 
    message:"Interview reports fetched successfully",
    interviewReports })
}   

/**
 * @description Controller to generate resume pdf based on user self description, resume and job description
 */
async function generateResumePdfController(req,res) {
    const {_interviewReportId} = req.params
    const interviewReport = await interviewReportModel.findById(_interviewReportId)

    if(!interviewReport){
        return res.status(404).json({
            message:"Interview report not found"
        })
    }

    const {resume,selfDescription,jobDescription} = interviewReport

    const pdfBuffer = await gererateResumePdf({resume,selfDescription,jobDescription})

    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=interview_report_${_interviewReportId}.pdf`,
        'Content-Length': pdfBuffer.length
    });
    res.send(pdfBuffer);
}
module.exports = {generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController}