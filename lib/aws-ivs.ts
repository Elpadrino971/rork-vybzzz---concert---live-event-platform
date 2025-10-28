import AWS from 'aws-sdk'

// Configure AWS SDK
const ivs = new AWS.IVS({
  region: process.env.AWS_REGION || 'eu-west-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

/**
 * Create a new IVS channel for streaming
 */
export async function createStreamChannel(
  channelName: string,
  artistId: string
): Promise<{
  success: boolean
  channelArn?: string
  ingestEndpoint?: string
  streamKey?: string
  playbackUrl?: string
  error?: string
}> {
  try {
    const params: AWS.IVS.CreateChannelRequest = {
      name: channelName,
      latencyMode: 'LOW',
      type: 'STANDARD',
      tags: {
        artist_id: artistId,
        platform: 'vybzzz',
      },
    }

    const channel = await ivs.createChannel(params).promise()

    if (!channel.channel || !channel.streamKey) {
      return { success: false, error: 'Failed to create channel' }
    }

    return {
      success: true,
      channelArn: channel.channel.arn,
      ingestEndpoint: channel.channel.ingestEndpoint,
      streamKey: channel.streamKey.value,
      playbackUrl: channel.channel.playbackUrl,
    }
  } catch (error: any) {
    console.error('Error creating IVS channel:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get stream key for an existing channel
 */
export async function getStreamKey(
  channelArn: string
): Promise<{ success: boolean; streamKey?: string; error?: string }> {
  try {
    const params: AWS.IVS.GetStreamKeyRequest = {
      arn: channelArn,
    }

    const result = await ivs.getStreamKey(params).promise()

    if (!result.streamKey) {
      return { success: false, error: 'Stream key not found' }
    }

    return {
      success: true,
      streamKey: result.streamKey.value,
    }
  } catch (error: any) {
    console.error('Error getting stream key:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get stream status (live or offline)
 */
export async function getStreamStatus(
  channelArn: string
): Promise<{
  success: boolean
  isLive?: boolean
  viewerCount?: number
  startTime?: Date
  error?: string
}> {
  try {
    const params: AWS.IVS.GetStreamRequest = {
      channelArn,
    }

    const result = await ivs.getStream(params).promise()

    if (!result.stream) {
      return { success: true, isLive: false }
    }

    return {
      success: true,
      isLive: result.stream.state === 'LIVE',
      viewerCount: result.stream.viewerCount,
      startTime: result.stream.startTime,
    }
  } catch (error: any) {
    // If stream doesn't exist, it means it's not live
    if (error.code === 'ResourceNotFoundException') {
      return { success: true, isLive: false }
    }

    console.error('Error getting stream status:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Stop a live stream
 */
export async function stopStream(
  channelArn: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const params: AWS.IVS.StopStreamRequest = {
      channelArn,
    }

    await ivs.stopStream(params).promise()

    return { success: true }
  } catch (error: any) {
    console.error('Error stopping stream:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete a stream channel
 */
export async function deleteStreamChannel(
  channelArn: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const params: AWS.IVS.DeleteChannelRequest = {
      arn: channelArn,
    }

    await ivs.deleteChannel(params).promise()

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting channel:', error)
    return { success: false, error: error.message }
  }
}

/**
 * List all channels
 */
export async function listChannels(): Promise<{
  success: boolean
  channels?: AWS.IVS.ChannelSummary[]
  error?: string
}> {
  try {
    const params: AWS.IVS.ListChannelsRequest = {
      maxResults: 50,
    }

    const result = await ivs.listChannels(params).promise()

    return {
      success: true,
      channels: result.channels,
    }
  } catch (error: any) {
    console.error('Error listing channels:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get playback URL for a channel
 */
export async function getPlaybackUrl(
  channelArn: string
): Promise<{ success: boolean; playbackUrl?: string; error?: string }> {
  try {
    const params: AWS.IVS.GetChannelRequest = {
      arn: channelArn,
    }

    const result = await ivs.getChannel(params).promise()

    if (!result.channel) {
      return { success: false, error: 'Channel not found' }
    }

    return {
      success: true,
      playbackUrl: result.channel.playbackUrl,
    }
  } catch (error: any) {
    console.error('Error getting playback URL:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create recording configuration for VOD
 */
export async function createRecordingConfiguration(
  name: string,
  s3BucketName: string
): Promise<{ success: boolean; arn?: string; error?: string }> {
  try {
    const params: AWS.IVS.CreateRecordingConfigurationRequest = {
      name,
      destinationConfiguration: {
        s3: {
          bucketName: s3BucketName,
        },
      },
    }

    const result = await ivs.createRecordingConfiguration(params).promise()

    return {
      success: true,
      arn: result.recordingConfiguration?.arn,
    }
  } catch (error: any) {
    console.error('Error creating recording configuration:', error)
    return { success: false, error: error.message }
  }
}
