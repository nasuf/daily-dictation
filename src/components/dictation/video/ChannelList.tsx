import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/api";
import { Channel } from "@/utils/type";
import {
  ChannelGrid,
  ChannelCard,
  ChannelImage,
  ChannelInfo,
  ChannelName,
} from "@/components/dictation/video/Widget";

const ChannelList: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await api.getChannels();
        setChannels(response.data);
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };

    fetchChannels();
  }, []);

  return (
    <ChannelGrid>
      {channels.map((channel) => (
        <Link key={channel.id} to={`/dictation/video/${channel.id}`}>
          <ChannelCard hoverable className="bg-white dark:bg-gray-700">
            <ChannelImage alt={channel.name} src={channel.image_url} />
            <ChannelInfo>
              <ChannelName
                level={5}
                className="text-gray-800 dark:text-gray-200"
              >
                {channel.name}
              </ChannelName>
            </ChannelInfo>
          </ChannelCard>
        </Link>
      ))}
    </ChannelGrid>
  );
};

export default ChannelList;
