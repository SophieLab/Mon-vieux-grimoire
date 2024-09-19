// Création de compte
exports.signup = async (req, res) => {
  //-On appelle la fonction hachage de bcrypt dans le mot de passe qui sera "salé" 10 fois
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    //-On crée une instance à partir du modèle User
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    //-On enregistre l'utilisateur dans la base de donées
    await user.save();
    res.status(201).json({ message: "Utilisateur crée avec succès !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

//- Connexion
exports.login = async (req, res) => {
  //-On vérifie l'existence de l'utilisateur dans la base de données
  try {
    const user = await User.findOne({ email: req.body.email });
    
    if (!user || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: "Requête invalide !" });
    }

    //-On compare le mot passe entré avec le hash qui est dans la base de données
    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Association identifiant/mot de passe incorrecte !" });
    }

    //-Si les informations sont valides, on renvoie une réponse contenant le userId et un token jwt
    res.status(200).json({
      userId: user._id,
      token: jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
        expiresIn: "24h",
      }),
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};