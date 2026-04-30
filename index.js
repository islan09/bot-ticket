require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

const { createTranscript } = require('discord-html-transcripts');

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
const LOGS_ID = "1499141431447650344";

// 📂 CATEGORIAS
const CATEGORIAS = {
  suporte: "1499171154655711262",
  aluguel: "1499171154655711262",
  vagas: "1499171154655711262"
};

// 📦 CATEGORIA DE ALUGADOS
const CATEGORIA_ALUGADOS = "1499479285054967848";

// ✅ BOT ONLINE
client.once("ready", () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
});

// =====================
client.on("interactionCreate", async (interaction) => {

  // 🎫 PAINEL
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "ticket") {

      const embed = new EmbedBuilder()
        .setColor('#7A00FF')
        .setTitle('⚡ LOJINHA ADRENALINA • CONTAS FULL ROXA')
        .setDescription(`
🎮 **Alugue contas full roxas para ganhar AP 🔥**

💰 A partir de **R$2,50**
⚡ Entrega automática
🔐 Contas seguras e verificadas

🚀 Entre, jogue e domine a partida!

💎 **LOJINHA ADRENALINA • Rápido e seguro 🔥**
        `)
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ text: "Selecione uma opção abaixo 👇" });

      const menu = new StringSelectMenuBuilder()
        .setCustomId('ticket_select')
        .setPlaceholder('Selecione um tipo de atendimento')
        .addOptions([
          { label: 'Suporte', value: 'suporte', emoji: '📩' },
          { label: 'Aluguel', value: 'aluguel', emoji: '🛒' },
          { label: 'Vagas ADM', value: 'vagas', emoji: '👑' }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      return interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  // =====================
  // 🎫 CRIAR TICKET
  if (interaction.isStringSelectMenu()) {

    await interaction.deferReply({ ephemeral: true });

    if (interaction.customId === 'ticket_select') {

      const tipo = interaction.values[0];

      const nomeUsuario = interaction.user.username
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      const existente = interaction.guild.channels.cache.find(
        c => c.name === `${tipo}-${nomeUsuario}`
      );

      if (existente) {
        return interaction.editReply({
          content: "❌ Você já tem um ticket aberto."
        });
      }

      let cor = "#ffffff";
      let mensagem = "";

      if (tipo === "suporte") {
        cor = "#00FF7F";
        mensagem = "🛠️ Suporte geral";
      }

      if (tipo === "aluguel") {
        cor = "#8A2BE2";
        mensagem = "🛒 Área de aluguel";
      }

      if (tipo === "vagas") {
        cor = "#1E90FF";
        mensagem = "👑 Vagas para equipe";
      }

      const canal = await interaction.guild.channels.create({
        name: `${tipo}-${nomeUsuario}`,
        type: ChannelType.GuildText,
        parent: CATEGORIAS[tipo],
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          },
          {
            id: SUPORTE_ID,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          }
        ]
      });

      const botoes = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("assumir_ticket")
          .setLabel("Assumir")
          .setEmoji("👤")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("fechar_ticket")
          .setLabel("Fechar")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger)
      );

      const embed = new EmbedBuilder()
        .setColor(cor)
        .setTitle(`🎫 Ticket ${tipo.toUpperCase()}`)
        .addFields(
          { name: "👤 Usuário", value: `${interaction.user}`, inline: true },
          { name: "📂 Tipo", value: mensagem, inline: true }
        )
        .setDescription("Explique seu pedido e aguarde atendimento.")
        .setFooter({ text: "LOJINHA ADRENALINA 🚀" });

      await canal.send({
        content: `<@${interaction.user.id}> <@&${SUPORTE_ID}>`,
        embeds: [embed],
        components: [botoes]
      });

      return interaction.editReply({
        content: "✅ Ticket criado com sucesso!"
      });
    }
  }

  // =====================
  // BOTÕES
  if (interaction.isButton()) {

    // 🔒 ASSUMIR (CORRIGIDO DE VERDADE)
    if (interaction.customId === "assumir_ticket") {

      if (!interaction.member.roles.cache.has(SUPORTE_ID)) {
        return interaction.reply({
          content: "❌ Apenas suporte pode assumir.",
          ephemeral: true
        });
      }

      const currentRow = interaction.message.components[0];

      // se já estiver desativado, bloqueia
      if (currentRow.components[0].disabled) {
        return interaction.reply({
          content: "❌ Esse ticket já foi assumido.",
          ephemeral: true
        });
      }

      const newRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("assumir_ticket")
          .setLabel(`Assumido por ${interaction.user.username}`)
          .setEmoji("✅")
          .setStyle(ButtonStyle.Success)
          .setDisabled(true),

        new ButtonBuilder()
          .setCustomId("fechar_ticket")
          .setLabel("Fechar")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.update({
        components: [newRow]
      });
    }

    // 🔒 FECHAR
    if (interaction.customId === "fechar_ticket") {

      if (!interaction.member.roles.cache.has(SUPORTE_ID)) {
        return interaction.reply({
          content: "❌ Apenas suporte pode fechar.",
          ephemeral: true
        });
      }

      await interaction.reply({
        content: "🔒 Fechando ticket...",
        ephemeral: true
      });

      setTimeout(async () => {

        const transcript = await createTranscript(interaction.channel, {
          limit: -1,
          returnType: "buffer"
        });

        const logs = interaction.guild.channels.cache.get(LOGS_ID);

        if (logs) {
          await logs.send({
            embeds: [
              new EmbedBuilder()
                .setTitle("📁 Ticket Fechado")
                .addFields(
                  { name: "Canal", value: `${interaction.channel.name}` },
                  { name: "Fechado por", value: `${interaction.user}` }
                )
                .setColor("Red")
            ],
            files: [{
              attachment: transcript,
              name: `ticket-${interaction.channel.name}.html`
            }]
          });
        }

        await interaction.channel.delete();

      }, 2000);
    }
  }
});

// =====================
// 🔥 COMANDO .r (CORRIGIDO)
// =====================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(".r")) return;

  if (!message.member.roles.cache.has(SUPORTE_ID)) return;

  const args = message.content.split(" ").slice(1);
  if (args.length < 2) return;

  const nome = args[0].toLowerCase().replace(/[^a-z0-9-]/g, '');
  const tempo = args[1];

  const novoNome = `${nome}-${tempo}`;

  try {
    await message.channel.setName(novoNome);
    await message.channel.setParent(CATEGORIA_ALUGADOS);

    // 🧹 apaga garantido
    await message.delete().catch(() => {});

  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.TOKEN);