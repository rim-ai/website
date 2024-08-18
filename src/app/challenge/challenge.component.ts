import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEvent, HttpClientModule, HttpEventType, HttpRequest } from '@angular/common/http';
import { FormsModule } from '@angular/forms';  // Import FormsModule here

interface ChallengeEntry {
  Email: string;
  Group_Name: string;
  Submission_Date: string;
  Unique_Images: number;
  Score: number;
}

@Component({
  selector: 'main-component',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.css']
})
export class ChallengeComponent implements OnInit {
  entries: ChallengeEntry[] = [];
  selectedFile: File | null = null;
  uploadInProgress: boolean = false;
  uploadProgress: number | null = null;
  private apiUrl = 'https://orca-app-ahhtz.ondigitalocean.app/api';

  canUpload: boolean = false;
  registrationMessage: string = '';
  reviewMode: boolean = false;
  errorMessage: string = '';  // To display error messages


  userEmail: string = '';
  submissionMessage: string = '';
  registrationData = {
    email: '',
    option: 'individual',
    numberOfMembers: 1,
    pseudoName: ''
  };
  teamMembers = [{ id: '' }];

  constructor(private http: HttpClient) { }




  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.http.get<ChallengeEntry[]>(`${this.apiUrl}/data`)  // Use the full URL
      .subscribe({
        next: (data) => this.entries = data,
        error: (err) => console.error('Fetch error:', err)
      });
  }
  checkSubmissionCount(): void {
    this.http.get<{ email: string, count: number }>(`${this.apiUrl}/count_submissions`, { params: { email: this.userEmail } })
      .subscribe({
        next: (response) => {
          this.submissionMessage = '';
          this.canUpload = true;

          if (response.count >= 3) {
            this.submissionMessage = 'You are no longer allowed to submit.';
            this.canUpload = false;
          }
        },
        error: (errorResponse) => {
          if (errorResponse.status === 404) {
            this.submissionMessage = 'You should register for the challenge.';
          } else if (errorResponse.status === 403) {
            this.submissionMessage = 'You are no longer allowed to submit.';
          } else {
            this.submissionMessage = 'Failed to verify the email. Please try again.';
          }
          this.canUpload = false;
        }
      });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  resetUpload(): void {
    this.selectedFile = null; // Reset the selected file
    this.uploadProgress = null; // Reset the progress bar if necessary
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      return;
    }
    this.uploadInProgress = true; // Start upload and disable the button

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    const req = new HttpRequest('POST', `${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    this.http.request(req).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total!);
        } else if (event.type === HttpEventType.Response) {
          this.uploadInProgress = false; // Upload complete, re-enable the button
          this.uploadProgress = null;
          console.log('Upload complete', event.body);
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.uploadInProgress = false; // Re-enable the button in case of error
        this.uploadProgress = null;
      }
    });
  }



  onOptionChange(): void {
    this.updateTeamMembers();
  }

  updateTeamMembers(): void {
    this.teamMembers = Array.from({ length: Math.min(this.registrationData.numberOfMembers, 5) }, () => ({ id: '' }));
  }

  prepareReview(): void {
    // Check if all required fields are filled
    if (!this.registrationData.email || !this.registrationData.pseudoName || this.teamMembers.some(member => !member.id)) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.errorMessage = ''; // Clear any previous error messages
    this.reviewMode = true;
  }

  submitRegistration(): void {
    const payload = {
      email: this.registrationData.email,
      time_registration: new Date().toISOString(),
      option: this.registrationData.option,
      number_of_members: this.registrationData.numberOfMembers,
      members_ids: this.teamMembers.map(m => m.id)
    };

    this.http.post(`${this.apiUrl}/registration`, payload).subscribe({
      next: (response) => {
        this.registrationMessage = 'Registration successful. You may now make your submissions. Remember, you are only allowed three submissions.';
        this.reviewMode = false;
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.registrationMessage = 'Registration failed. Please try again.';
        this.reviewMode = true;  // Keep user in review mode to correct data
      }
    });
  }

}
