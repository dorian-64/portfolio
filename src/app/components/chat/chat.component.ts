import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { MatchService } from '../../services/match.service';
import { ProfileService } from '../../services/profile.service';
import { Message, Match } from '../../models/message.model';
import { Profile } from '../../models/profile.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer', { static: false }) private messagesContainer: ElementRef;

  match: Match | null = null;
  otherProfile: Profile | null = null;
  messages: Message[] = [];
  newMessage = '';
  currentUserId: string;
  isTyping = false;
  private typingTimer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private chatService: ChatService,
    private matchService: MatchService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user) { this.router.navigate(['/connexion']); return; }
    this.currentUserId = user.id;

    const matchId = this.route.snapshot.paramMap.get('id');
    this.match = this.matchService.getMatchById(matchId);
    if (!this.match) { this.router.navigate(['/matchs']); return; }

    const otherId = this.matchService.getOtherUserId(this.match, this.currentUserId);
    this.otherProfile = this.profileService.getAllProfiles().find(p => p.userId === otherId) || null;

    this.loadMessages();
    this.chatService.markAsRead(matchId, this.currentUserId);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  loadMessages() {
    this.messages = this.chatService.getMessages(this.match.id);
  }

  sendMessage() {
    const content = this.newMessage.trim();
    if (!content) { return; }
    this.newMessage = '';
    this.chatService.sendMessage(this.match.id, this.currentUserId, content);
    this.loadMessages();

    // Simulate a reply from the other user after a delay
    if (this.otherProfile && this.otherProfile.isMock) {
      this.simulateReply();
    }
  }

  private simulateReply() {
    const replies = [
      'C\'est super ! Parle-moi de toi 😊',
      'Je suis d\'accord avec toi !',
      'Oh vraiment ? C\'est intéressant !',
      'Ça me fait penser à quelque chose...',
      'Haha, t\'as raison !',
      'J\'adore cette idée !',
      'On devrait se retrouver un jour !',
      'Tu fais quoi ce week-end ?',
    ];
    const delay = 1500 + Math.random() * 2000;
    this.isTyping = true;
    setTimeout(() => {
      this.isTyping = false;
      const reply = replies[Math.floor(Math.random() * replies.length)];
      this.chatService.sendMessage(this.match.id, this.otherProfile.userId, reply);
      this.loadMessages();
    }, delay);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom() {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (e) {}
  }

  getInitials(p: Profile): string {
    return (p.firstName.charAt(0) + p.lastName.charAt(0)).toUpperCase();
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  isMine(msg: Message): boolean {
    return msg.senderId === this.currentUserId;
  }

  goBack() {
    this.router.navigate(['/matchs']);
  }
}
