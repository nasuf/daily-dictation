import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Progress } from "antd";
import { api } from "@/api/api";
import { Video } from "@/utils/type";
import { ScrollableContainer, VideoCardGrid } from "./Widget";

const VideoList: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const [videos, setVideos] = useState<Video[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videoResponse, progressResponse] = await Promise.all([
          api.getVideoList(channelId!),
          api.getChannelProgress(channelId!),
        ]);
        setVideos(videoResponse.data.videos);
        setProgress(progressResponse.data.progress);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [channelId]);

  return (
    <ScrollableContainer>
      <VideoCardGrid>
        {videos.map((video) => (
          <Link
            key={video.video_id}
            to={`/dictation/video/${channelId}/${video.video_id}`}
          >
            <Card
              hoverable
              cover={
                <img
                  alt={video.title}
                  src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                />
              }
            >
              <Card.Meta title={video.title} />
              <Progress
                percent={progress[video.video_id] || 0}
                size="small"
                status="active"
                style={{ marginTop: "10px" }}
              />
            </Card>
          </Link>
        ))}
      </VideoCardGrid>
    </ScrollableContainer>
  );
};

export default VideoList;
