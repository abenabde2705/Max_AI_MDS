import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import CrisisAlert from '../models/CrisisAlert.js';

const router = Router();

// ─── Users ────────────────────────────────────────────────────────────────────

router.get('/admin/users', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const search = (req.query.search as string) || '';
    const whereClause: any = {};
    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'email', 'firstName', 'lastName', 'isPremium', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    const allSubs = await Subscription.findAll({ where: { status: 'active' } });
    const subsMap = new Map<string, string>();
    for (const sub of allSubs) {
      subsMap.set(sub.getDataValue('userId'), sub.getDataValue('plan'));
    }

    const allConvs = await Conversation.findAll({ attributes: ['id', 'userId'] });
    const convIdsByUser = new Map<string, string[]>();
    for (const conv of allConvs) {
      const uid = conv.getDataValue('userId');
      if (!convIdsByUser.has(uid)) convIdsByUser.set(uid, []);
      convIdsByUser.get(uid)!.push(conv.getDataValue('id'));
    }

    const allConvIds = allConvs.map((c) => c.getDataValue('id'));
    const msgCountsRaw = allConvIds.length === 0 ? [] : await Message.findAll({
      attributes: ['conversationId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: { sender: 'user', conversationId: { [Op.in]: allConvIds } },
      group: ['conversationId'],
    });
    const msgCountByConv = new Map<string, number>();
    for (const row of msgCountsRaw) {
      msgCountByConv.set(row.getDataValue('conversationId'), parseInt((row as any).dataValues.count, 10));
    }

    const usersData = users.map((user) => {
      const uid = user.getDataValue('id');
      const userConvIds = convIdsByUser.get(uid) || [];
      const msgCount = userConvIds.reduce((sum, cid) => sum + (msgCountByConv.get(cid) || 0), 0);
      const plan = subsMap.get(uid) || 'free';
      return {
        id: uid,
        email: user.getDataValue('email'),
        firstName: user.getDataValue('firstName'),
        lastName: user.getDataValue('lastName'),
        role: user.getDataValue('role'),
        plan,
        messageCount: msgCount,
        createdAt: user.getDataValue('createdAt'),
      };
    });

    res.json({
      success: true,
      data: {
        users: usersData,
        stats: {
          total: usersData.length,
          active: usersData.filter((u) => u.messageCount > 0).length,
          paying: usersData.filter((u) => u.plan !== 'free').length,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Admin GET /users error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.delete('/admin/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req.user as any).id;
    if (id === adminId) {
      res.status(400).json({ success: false, message: 'Impossible de supprimer votre propre compte' });
      return;
    }
    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      return;
    }
    await user.destroy();
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error: unknown) {
    console.error('Admin DELETE /users/:id error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ─── Subscriptions ────────────────────────────────────────────────────────────

router.get('/admin/subscriptions', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const subs = await Subscription.findAll({ order: [['startDate', 'DESC']] });

    const userIds = [...new Set(subs.map((s) => s.getDataValue('userId')))];
    const users = userIds.length === 0 ? [] : await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ['id', 'email', 'firstName', 'lastName'],
    });
    const userMap = new Map<string, any>();
    for (const u of users) {
      userMap.set(u.getDataValue('id'), {
        email: u.getDataValue('email'),
        firstName: u.getDataValue('firstName'),
        lastName: u.getDataValue('lastName'),
      });
    }

    const subsData = subs.map((sub) => {
      const uid = sub.getDataValue('userId');
      const user = userMap.get(uid) || {};
      return {
        id: sub.getDataValue('id'),
        userId: uid,
        userEmail: user.email || null,
        userFirstName: user.firstName || null,
        userLastName: user.lastName || null,
        plan: sub.getDataValue('plan'),
        status: sub.getDataValue('status'),
        startDate: sub.getDataValue('startDate'),
        endDate: sub.getDataValue('endDate'),
        stripePeriodEnd: sub.getDataValue('stripePeriodEnd'),
      };
    });

    const active = subsData.filter((s) => s.status === 'active');
    const premiumCount = active.filter((s) => s.plan === 'premium').length;
    const studentCount = active.filter((s) => s.plan === 'student').length;
    const totalUsers = await User.count();
    const monthlyRevenue = premiumCount * 14.99 + studentCount * 8;

    res.json({
      success: true,
      data: {
        subscriptions: subsData,
        stats: {
          monthlyRevenue: monthlyRevenue.toFixed(2),
          premiumCount,
          studentCount,
          freeCount: Math.max(0, totalUsers - active.length),
        },
      },
    });
  } catch (error: unknown) {
    console.error('Admin GET /subscriptions error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ─── Crisis Alerts ────────────────────────────────────────────────────────────

router.get('/admin/crisis-alerts', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const filter = (req.query.filter as string) || 'all';
    const whereClause: any = {};
    if (filter === 'unread') whereClause.status = 'unread';
    if (filter === 'urgent') whereClause.severity = 'urgent';

    const alerts = await CrisisAlert.findAll({
      where: whereClause,
      order: [['detectedAt', 'DESC']],
    });

    const messageIds = alerts.map((a) => a.getDataValue('messageId'));
    const userIds = [...new Set(alerts.map((a) => a.getDataValue('userId')))];

    const [messages, users] = await Promise.all([
      messageIds.length === 0 ? [] : Message.findAll({
        where: { id: { [Op.in]: messageIds } },
        attributes: ['id', 'content', 'sentAt'],
      }),
      userIds.length === 0 ? [] : User.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: ['id', 'email', 'firstName', 'lastName'],
      }),
    ]);

    const messageMap = new Map<string, any>();
    for (const m of messages) {
      messageMap.set(m.getDataValue('id'), {
        content: m.getDataValue('content'),
        sentAt: m.getDataValue('sentAt'),
      });
    }
    const userMap = new Map<string, any>();
    for (const u of users) {
      userMap.set(u.getDataValue('id'), {
        email: u.getDataValue('email'),
        firstName: u.getDataValue('firstName'),
        lastName: u.getDataValue('lastName'),
      });
    }

    const alertsData = alerts.map((alert) => {
      const msgId = alert.getDataValue('messageId');
      const uid = alert.getDataValue('userId');
      const msg = messageMap.get(msgId) || {};
      const user = userMap.get(uid) || {};
      return {
        id: alert.getDataValue('id'),
        messageId: msgId,
        userId: uid,
        userEmail: user.email || null,
        userFirstName: user.firstName || null,
        userLastName: user.lastName || null,
        messageContent: msg.content || '',
        severity: alert.getDataValue('severity'),
        status: alert.getDataValue('status'),
        detectedAt: alert.getDataValue('detectedAt'),
        resolvedAt: alert.getDataValue('resolvedAt'),
      };
    });

    res.json({
      success: true,
      data: {
        alerts: alertsData,
        stats: {
          total: alertsData.length,
          unread: alertsData.filter((a) => a.status === 'unread').length,
          urgent: alertsData.filter((a) => a.severity === 'urgent').length,
          resolved: alertsData.filter((a) => a.status === 'resolved').length,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Admin GET /crisis-alerts error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.patch('/admin/crisis-alerts/:id/resolve', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req.user as any).id;
    const alert = await CrisisAlert.findByPk(id);
    if (!alert) {
      res.status(404).json({ success: false, message: 'Alerte non trouvée' });
      return;
    }
    await alert.update({ status: 'resolved', resolvedAt: new Date(), resolvedBy: adminId });
    res.json({ success: true, message: 'Alerte résolue' });
  } catch (error: unknown) {
    console.error('Admin PATCH /crisis-alerts/:id/resolve error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;
