import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEvent, HttpClientModule, HttpEventType, HttpRequest } from '@angular/common/http';
import { FormsModule } from '@angular/forms';  // Import FormsModule here
import JSZip from 'jszip';

interface ChallengeEntry {
  GID: string;
  SCORE_FINALE: number;
}

@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.css']
})
export class SubmissionComponent implements OnInit {
  entries: ChallengeEntry[] = [];

  private apiUrl = 'https://orca-app-ahhtz.ondigitalocean.app/api';


  submissionMessageClass: string = '';

  canUpload: boolean = false;
  registrationMessage: string = '';
  reviewMode: boolean = false;
  errorMessage: string = '';
  userEmail: string = '';
  userGroupId: string = '';
  selectedFile: File | null = null;
  uploadProgress: number | null = null;
  uploadInProgress: boolean = false;


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
    if (!this.userEmail || !this.userGroupId) {
      this.submissionMessage = 'Both email and group ID are required.';
      this.canUpload = false;
      return;
    }

    this.http.get<{ status: string, email: string, count: number }>(`${this.apiUrl}/count_submissions`, {
      params: {
        email: this.userEmail,
        group_id: this.userGroupId
      }
    }).subscribe({
      next: (response) => {
        if (response.status === 'not_registered') {
          this.submissionMessage = 'You should register for the challenge.';
          this.canUpload = false;
        } else if (response.status === 'submission_limit_exceeded') {
          this.submissionMessage = 'You are no longer allowed to submit.';
          this.canUpload = false;
        } else if (response.status === 'allowed_to_submit') {
          this.submissionMessage = '';
          this.canUpload = true;
        }
      },
      error: () => {
        this.submissionMessage = 'Failed to verify the email and group ID. Please try again.';
        this.canUpload = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.name.endsWith('.zip')) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
      this.submissionMessage = 'Only ZIP files are accepted.';
      this.submissionMessageClass = 'text-red-500';
    }
  }

  resetUpload(): void {
    window.location.reload();
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      return;
    }
    this.uploadInProgress = true; // Start upload and disable the button

    const formData = new FormData();
    formData.append('file', this.selectedFile, `${this.userEmail}_${this.userGroupId}_${this.selectedFile.name}`);

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
          if (event.body && event.body.status === 'success') {
            this.submissionMessage = 'File uploaded successfully. Please refresh the page after a few seconds to see the score.';
            this.submissionMessageClass = 'text-green-500';
            this.canUpload = false; // Disable the upload button
            setTimeout(() => window.location.reload(), 20000); // Refresh page after 20 seconds
          } else {
            this.submissionMessage = 'File uploaded but processing failed. Please try again later.';
            this.submissionMessageClass = 'text-red-500';
          }
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.uploadInProgress = false; // Re-enable the button in case of error
        this.uploadProgress = null;
        this.submissionMessage = `Upload failed. Error: ${error.error.message}. Ensure the file is a valid ZIP and try again. If the problem persists, please fill out this form.`;
        this.submissionMessageClass = 'text-red-500';
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
