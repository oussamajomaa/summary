import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ClipboardService } from 'ngx-clipboard';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-summary',
	templateUrl: './summary.component.html',
	styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {

	@ViewChild('text') text: ElementRef;
	@ViewChild('select') select: ElementRef;
	@ViewChild('container') container: ElementRef;
	@ViewChild('inputFile') inputFile: ElementRef;
	@ViewChild('resume_text') resume_text: ElementRef;
	title = 'ng_nlp';
	file: any
	resume: string
	textWord = 0
	resumeWord = 0
	spinner = false
	processTime = 0
	character = 0
	model: string
	fileName: string
	upload = false
	isModel = false
	max_length = 20;
	extension: string
	allSummaries = []
	keyWord = []
	min: number
	max: number
	isData = true
	robot = true
	isTranslator = false
	textAreaSource: string
	textTranslated = ""
	generalSummary = ""
	keywords = []
	fileUrl
	translated = ""
	target = "fr"
	tagTitles = []
	tags = []

	siteKey = "6Le-7OYiAAAAANYoAmPdhNWC2WakmiCd_JHZ3bGt"
	recaptcha: any
	aFormGroup: FormGroup
	public captchaEl: FormControl = new FormControl(null, Validators.required);

	constructor(
		private http: HttpClient,
		public auth: AuthService,
		private formBuilder: FormBuilder,
		private clipboardService: ClipboardService,
		private sanitizer: DomSanitizer,
		private reCaptchaV3Service: ReCaptchaV3Service
	) {

	}

	ngOnInit(): void {
		this.aFormGroup = this.formBuilder.group({
			recaptcha: ['', Validators.required]
		})
	}

	resolved(captchaResponse: string) {
		console.log(`Resolved captcha with response: ${captchaResponse}`);
	}
	success() {
		this.robot = true
	}
	rangeChange(value) {
		this.max_length = value
	}

	onSelectModel(e) {
		this.model = e.target.value
	}

	changeText() {
		this.tags = []
		this.tagTitles = []
		this.upload = false
		this.inputFile.nativeElement.value = ""
		this.textWord = this.countWords(this.text.nativeElement.value)
		this.fileName = ''
		this.character = (this.text.nativeElement.value).length
	}

	uploadFile(e) {
		this.tags = []
		this.tagTitles = []
		this.keyWord = []
		this.allSummaries = []
		if (e.target.files[0]) {
			this.text.nativeElement.value = ""
			this.file = e.target.files[0]
			this.fileName = this.file.name
			this.extension = this.fileName.split('.')[1]

			if (this.file) {
				this.resume = ""
				this.spinner = false
				let reader = new FileReader();
				reader.onload = () => {
					this.text.nativeElement.value = reader.result;
					this.textWord = this.countWords(this.text.nativeElement.value)
					this.character = (this.text.nativeElement.value).length
					this.upload = true
				};
				reader.readAsText(this.file);

				// récupérer les balises title
				if (this.extension === "xml") {
					const formData = new FormData()

					formData.append("name", this.file.name);
					formData.append("file", this.file, this.file.name);
					// this.http.post(`${environment.url_local}/titles`, formData)
					this.http.post(`${environment.url}/titles`, formData)
						.subscribe((res: any) => this.tagTitles = res)
				}
			}
		}

	}

	selectTag(e, title) {
		if (e.target.checked) {
			this.tags.push(title)
		}
		else {
			this.tags = this.tags.filter(el => {
				return !(el === title)
			})
		}
	}

	summarize() {
		this.allSummaries = []
		this.keyWord = []
		if (this.model) {
			this.select.nativeElement.setAttribute
				('style',
					`
					box-shadow: rgba(3, 102, 214, 0.3) 0px 0px 0px 3px;
					width:350px; 
					padding: 5px;
					padding-top: 10px;
					padding-bottom: 10px;
				`
				)
			if (this.text.nativeElement.value && !this.upload) {
				if (this.textWord <= 400) {
					const start = new Date().getTime()
					const text = this.text.nativeElement.value
					if (text && this.textWord > 8) {
						this.spinner = true
						this.resume = ""
						this.textWord = this.countWords(text)

						this.http.post(environment.url, JSON.stringify(text),
							{
								params:
								{
									model: this.model,
									max_length: this.max_length
								}
							})
							.subscribe((res: any) => {
								if (res.summary.length === 0) {
									this.spinner = false
									Swal.fire('No Data', 'There is no summary!', 'info')
								}
								else {

									this.resume = "Summary" + "\n"
									this.resume += res.summary
									this.textTranslated = res.summary
									this.keywords = res.keywords
									this.resume += "\n" + "\n" + "Keywords" + "\n"
									this.keywords.forEach(key => {
										this.resume += key + " - "
									})

									this.resumeWord = this.countWords(this.textTranslated)
									const end = new Date().getTime()
									this.processTime = (end - start) / 1000
									this.spinner = false
								}
							})
					}
				}
				else {
					// alert('The text exceeded 400 words!')
					Swal.fire('warning', 'The text exceeded 400 words!', 'warning')
				}
			}
			if (this.fileName && this.upload) {
				this.resume = ""
				const formData = new FormData()

				const start = new Date().getTime()
				this.spinner = true
				this.resume = ""
				formData.append("name", this.file.name);
				formData.append("file", this.file, this.file.name);
				
				if (this.extension === "xml") {
					if (this.tags.length > 0) {
						// this.http.post(`${environment.url_local}/file`, formData,
							this.http.post(`${environment.url}/file`, formData,
							{
								params:
								{
									model: this.model,
									max_length: this.max_length,
									extension: this.extension,
									tags: JSON.stringify(this.tags)
								}
							})
							.subscribe((res: any) => {


								if (res.data.length === 0) {
									this.spinner = false
									this.isData = false
									// Swal.fire('No Data','There is no summary!','info')
								}

								// Assign the array of data = [{title,summary={summary,keywords}},..] to allSummaries
								this.allSummaries = res.data

								// Assign the general summary
								this.generalSummary = res.general_summary

								// Assign the array of general keywords to keyword
								this.keyWord = res.kw

								// Add the title "GENERAL SUMMARY" and the content of general summary to resume
								this.resume += "GENERAL SUMMARY" + "\n" + this.generalSummary + "\n" + "\n"
								// Add the title "GENERAL KEYWORD" and the content of keyword to resume
								this.resume += "GENERAL KEYWORD" + "\n" + this.keyWord + '\n' + '\n'
								// Get the title and summary of every block and add theme to resume
								this.allSummaries.forEach(element => {
									this.resume += element.title + '\n'
									// Asign the title and summary to testTranslated for translating
									this.textTranslated += element.title + '\n'
									this.resume += element.summary.summary + '\n' + '\n'
									this.textTranslated += element.summary.summary + '\n' + '\n'
									this.resume += "Keywords" + "\n"
									element.summary.keywords.forEach(key => {
										this.resume += key + " - "
									})
									this.resume += '\n' + '\n'
								});
								// Count the words of resume
								this.resumeWord = this.countWords(this.textTranslated)
								const end = new Date().getTime()
								this.processTime = (end - start) / 1000
								this.spinner = false
								// Download text file
								const data = this.resume
								const blob = new Blob([data], { type: 'application/octet-stream' });
								this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
								this.text.nativeElement.value = "" // clear textarea
								this.inputFile.nativeElement.value = ""
								this.fileName = ""
								this.tags = []
								this.tagTitles = []
							})
					}
					else {
						this.spinner = false
						Swal.fire('warning', 'Choose section please!', 'warning')
					}

				}

				if (this.extension === "txt") {
					// this.http.post(`${environment.url_local}/file`, formData,
						this.http.post(`${environment.url}/file`, formData,
						{
							params:
							{
								model: this.model,
								max_length: this.max_length,
								extension: this.extension,
								tags: JSON.stringify(this.tags)
							}
						})
						.subscribe((res: any) => {

							// this.http.post(`${environment.url_local}/file`, formData,


							if (res.summary.length === 0) {
								this.spinner = false
								this.isData = false
								// Swal.fire('No Data','There is no summary!','info')
							}
							this.resume = "Summary" + "\n"
							this.resume += res.summary
							this.textTranslated = res.summary
							this.keywords = res.keywords
							this.resume += "\n" + "\n" + "Keywords" + "\n"
							this.keywords.forEach(key => {
								this.resume += key + " - "
							})

							this.resumeWord = this.countWords(this.textTranslated)
							const end = new Date().getTime()
							this.processTime = (end - start) / 1000
							this.spinner = false
							// Download text file
							const data = this.resume
							const blob = new Blob([data], { type: 'application/octet-stream' });
							this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
						})
				}

				

			}
		}
		else {
			// this.isModel = true
			Swal.fire('warning', 'Choose model please!', 'warning')
		}
	}

	copyText() {
		this.clipboardService.copyFromContent(this.resume);
	}


	translate() {
		if (this.textTranslated) {
			this.isTranslator = true
			this.http.post(`${environment.url}/translate`,
				JSON.stringify(this.textTranslated),
				{ params: { target: this.target } })
				.subscribe((res: any) => {
					this.translated = res
				})
		}
	}

	onSelectTarget(event) {
		this.target = event.target.value
		this.translate()
	}

	// onSelectSource(event){
	// 	this.source = event.target.value
	// 	this.translate()
	// }

	closeDialog() {
		this.isModel = false
		this.select.nativeElement.focus()
		this.select.nativeElement.setAttribute('style', 'box-shadow: rgba(214, 3, 3, 0.87) 0px 0px 0px 3px; 0px 0px 0px 3px;padding: 3px; width:350px; ')
		this.select.nativeElement.setAttribute
			('style',
				`
					box-shadow: rgba(214, 3, 3, 0.87) 0px 0px 0px 3px; 0px 0px 0px 3px;
					width:350px; 
					padding: 5px;
					padding-top: 10px;
					padding-bottom: 10px;
				`
			)

	}

	closeDialogMsg() {
		this.isData = true
		this.isTranslator = false
	}

	clearText() {
		this.text.nativeElement.value = "" // clear textarea
		this.inputFile.nativeElement.value = "" // clear input file
		this.text.nativeElement.focus()
		this.resume = ""
		this.textWord = 0
		this.resumeWord = 0
		this.spinner = false
		this.character = 0
		this.fileName = ""
		this.upload = false
		this.tags = []
		this.tagTitles = []
	}

	countWords(str: String) {
		return str.trim().split(/\s+/).length
	}





}
