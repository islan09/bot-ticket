require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// 🔐 CONFIG
const SUPORTE_ID = "1493784454660096141";
const CATEGORIA_COMPRAS = "1499171491688874024";

// ✅ BOT ONLINE
client.once("ready", () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
});

// =====================
// 🔘 INTERAÇÕES
// =====================
client.on("interactionCreate", async (interaction) => {

  if (!interaction.isButton()) return;

  // =====================
  // 🛒 COMPRAR
  // =====================
  if (interaction.customId.startsWith("comprar_")) {

    const produto = interaction.customId.split("_")[1];
    const user = interaction.user;

    // 🔒 NÃO DEIXA CRIAR DUPLICADO
    const existente = interaction.guild.channels.cache.find(c =>
      c.name === `🛒-${user.username.toLowerCase()}`
    );

    if (existente) {
      return interaction.reply({
        content: "❌ Você já tem um pedido aberto.",
        ephemeral: true
      });
    }

    const canal = await interaction.guild.channels.create({
      name: `🛒-${user.username.toLowerCase()}`,
      type: ChannelType.GuildText,
      parent: CATEGORIA_COMPRAS,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        },
        {
          id: SUPORTE_ID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        }
      ]
    });

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("🧾 Revisão do Pedido")
      .addFields(
        { name: "📦 Produto", value: produto, inline: true },
        { name: "💰 Preço", value: "R$20", inline: true },
        { name: "📦 Estoque", value: "1", inline: true }
      )
      .setFooter({ text: "Finalize abaixo 👇" });

    const botoes = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("pagar")
        .setLabel("Ir para pagamento")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("cancelar")
        .setLabel("Cancelar")
        .setStyle(ButtonStyle.Danger)
    );

    await canal.send({
      content: `<@${user.id}>`,
      embeds: [embed],
      components: [botoes]
    });

    return interaction.reply({
      content: "✅ Pedido criado!",
      ephemeral: true
    });
  }

  // =====================
  // ❌ CANCELAR
  // =====================
  if (interaction.customId === "cancelar") {
    return interaction.channel.delete().catch(() => {});
  }

  // =====================
  // 💰 PAGAR
  // =====================
  if (interaction.customId === "pagar") {
    return interaction.reply({
      content: "💰 Sistema de pagamento aqui (PIX depois)",
      ephemeral: true
    });
  }
});

// =====================
// 📦 COMANDO .PAINEL
// =====================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === ".painel") {

    if (!message.member.roles.cache.has(SUPORTE_ID)) return;

    const embed = new EmbedBuilder()
      .setColor("#7A00FF")
      .setTitle("🔥 CONTA FULL ROXA")
      .setDescription(`
💎 Conta pronta pra uso

💰 **Preço:** R$20  
📦 **Estoque:** 1
      `);

    const botao = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("comprar_fullroxa")
        .setLabel("Comprar")
        .setEmoji("🛒")
        .setStyle(ButtonStyle.Primary)
    );

    await message.channel.send({
      embeds: [embed],
      components: [botao]
    });

    // 🧹 apaga comando
    await message.delete().catch(() => {});
  }
});

client.login(process.env.TOKEN);