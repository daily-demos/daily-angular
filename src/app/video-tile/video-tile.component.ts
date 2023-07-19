import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from "@angular/core";
import { DailyParticipant } from "@daily-co/daily-js";

@Component({
  selector: "video-tile",
  templateUrl: "./video-tile.component.html",
  styleUrls: ["./video-tile.component.css"],
})
export class VideoTileComponent {
  @Input() participant: DailyParticipant;
  videoTrack: MediaStream;
  audioTrack: MediaStream;
  @Output() leaveCallClick: EventEmitter<null> = new EventEmitter();
  @Output() toggleVideoClick: EventEmitter<null> = new EventEmitter();
  @Output() toggleAudioClick: EventEmitter<null> = new EventEmitter();

  ngOnInit(): void {
    // Add tracks when the participant joins
    this.addTracks(this.participant);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes["participant"].previousValue) {
      // If tracks weren't available on join, add tracks after the first update
      this.addTracks(changes["participant"].currentValue);
    }
  }

  addTracks(p: DailyParticipant): void {
    if (p.tracks.video.persistentTrack) {
      this.videoTrack = new MediaStream([p.tracks.video.persistentTrack]);
    }
    if (p.tracks.audio.persistentTrack) {
      this.audioTrack = new MediaStream([p.tracks.audio.persistentTrack]);
    }
  }

  toggleVideo(): void {
    this.toggleVideoClick.emit();
  }
  toggleAudio(): void {
    this.toggleAudioClick.emit();
  }
  handleLeaveCallClick(): void {
    this.leaveCallClick.emit();
  }
}
