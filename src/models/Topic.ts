// Observer interface
export interface Observer {
  update(topic: string, postTitle: string): void;
}

// Subject interface
export interface Subject {
  subscribe(observer: Observer): void;
  unsubscribe(observer: Observer): void;
  notify(postTitle: string): void;
}

export interface TopicData {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

// Topic class implementing Subject
export class Topic implements Subject {
  private observers: Observer[] = [];
  
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public imageUrl: string
  ) {}

  subscribe(observer: Observer): void {
    const isExist = this.observers.includes(observer);
    if (!isExist) {
      this.observers.push(observer);
    }
  }

  unsubscribe(observer: Observer): void {
    const observerIndex = this.observers.findIndex(obs => obs === observer);
    if (observerIndex !== -1) {
      this.observers.splice(observerIndex, 1);
    }
  }

  notify(postTitle: string): void {
    for (const observer of this.observers) {
      observer.update(this.name, postTitle);
    }
  }

  // Method to publish a new post
  publishPost(postTitle: string): void {
    console.log(`New post published in ${this.name}: "${postTitle}"`);
    this.notify(postTitle);
  }
}

// Factory function to create a Topic instance from TopicData
export function createTopic(topicData: TopicData): Topic {
  return new Topic(
    topicData.id,
    topicData.name,
    topicData.description,
    topicData.imageUrl
  );
} 