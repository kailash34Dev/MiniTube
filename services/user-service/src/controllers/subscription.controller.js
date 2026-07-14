import { Subscription, User, asyncHandler, ApiError } from "@minitube/shared";

// Toggle subscription status
export const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user.id;

    if (subscriberId === channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId,
    });

    let action;
    if (existingSubscription) {
        // Unsubscribe
        await Subscription.findByIdAndDelete(existingSubscription._id);
        channel.subscriberCount = Math.max(0, (channel.subscriberCount || 0) - 1);
        action = "unsubscribed";
    } else {
        // Subscribe
        await Subscription.create({
            subscriber: subscriberId,
            channel: channelId,
        });
        channel.subscriberCount = (channel.subscriberCount || 0) + 1;
        action = "subscribed";
    }

    await channel.save();

    res.status(200).json({
        success: true,
        action,
        subscriberCount: channel.subscriberCount,
    });
});

// Check subscription status
export const checkSubscriptionStatus = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user.id;

    const subscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId,
    });

    res.status(200).json({
        success: true,
        isSubscribed: !!subscription,
    });
});

// Get channel profile (public)
export const getChannelProfile = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const channel = await User.findById(channelId).select("displayName profilePicture subscriberCount");
    
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    res.status(200).json({
        success: true,
        channel,
    });
});
