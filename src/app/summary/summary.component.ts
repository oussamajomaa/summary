import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';


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

	constructor(private http: HttpClient) {

	}
	

	onSelectModel(e) {
		this.model = e.target.value
	}

	changeText() {
		this.upload = false
		this.inputFile.nativeElement.value = ""
		this.textWord = this.countWords(this.text.nativeElement.value)
		this.character = (this.text.nativeElement.value).length
	}

	uploadFile(e) {
		console.log(e.target.files[0]);
		if (e.target.files[0]){
			this.text.nativeElement.value = ""
			this.file = e.target.files[0]
			this.fileName = this.file.name
			if (this.file) {
				let reader = new FileReader();
				reader.onload = () => {
					this.text.nativeElement.value=reader.result;
					this.textWord = this.countWords(this.text.nativeElement.value)
					this.character = (this.text.nativeElement.value).length
					this.upload = true
				};
				reader.readAsText(this.file);
			}
		}

	}

	summarize() {
		if (this.model){
			this.select.nativeElement.setAttribute('style', 'box-shadow: rgba(3, 102, 214, 0.3) 0px 0px 0px 3px;padding: 3px; width:350px; ')
			if (this.text.nativeElement.value && !this.upload) {
				console.log(this.text.nativeElement.value);
	
				const start = new Date().getTime()
				const text = this.text.nativeElement.value
				if (text && this.textWord > 8) {
					this.spinner = true
					this.resume = ""
					this.textWord = this.countWords(text)
	
					this.http.post(`http://localhost:8000`, JSON.stringify(text), { params: { model: this.model } })
						.subscribe((res: any) => {
							this.resume = res
							this.resumeWord = this.countWords(this.resume)
							const end = new Date().getTime()
							this.processTime = (end - start) / 1000
						})
				}
			}
			if (this.fileName && this.upload) {
				
				this.resume = ""
				console.log(this.file);
				const formData = new FormData()
	
				const start = new Date().getTime()
				this.spinner = true
				this.resume = ""
				formData.append("name", this.file.name);
				formData.append("file", this.file, this.file.name);
				this.http.post(`http://localhost:8000/file`, formData, { params: { model: this.model } })
					.subscribe((res: any) => {
						this.resume = res
						this.resumeWord = this.countWords(this.resume)
						const end = new Date().getTime()
						this.processTime = (end - start) / 1000
						// this.spinner = false
					})
			}
		}
		else{
			this.isModel = true
		}
	}

	closeDialog(){
		this.isModel = false
		this.select.nativeElement.focus()
		this.select.nativeElement.setAttribute('style', 'box-shadow: rgba(214, 3, 3, 0.87) 0px 0px 0px 3px; 0px 0px 0px 3px;padding: 3px; width:350px; ')
		
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
	}

	countWords(str: String) {
		return str.trim().split(/\s+/).length
	}

	ngOnInit(): void {
	}



}
